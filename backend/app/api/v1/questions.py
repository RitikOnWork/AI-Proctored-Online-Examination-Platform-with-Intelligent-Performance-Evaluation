import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, File, UploadFile, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.users import User
from app.models.question_bank import QuestionType
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from app.repositories.question import QuestionRepository
from app.services.question import QuestionService
from app.dependencies.auth import get_current_user, get_current_examiner, RoleChecker

router = APIRouter(prefix="/questions", tags=["Question Bank Management"])


# Dependency injection helpers
async def get_question_repository(db: AsyncSession = Depends(get_db)) -> QuestionRepository:
    return QuestionRepository(db)


async def get_question_service(
    question_repo: QuestionRepository = Depends(get_question_repository)
) -> QuestionService:
    return QuestionService(question_repo)


@router.post(
    "",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Question (Examiner Only)",
    description="Only accessible by users with the 'examiner' role. Supports MCQ, Multi-Select, Short/Long Answers, and Image Uploads."
)
async def create_question(
    question_in: QuestionCreate,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(RoleChecker(["examiner", "admin"]))
):
    return await question_service.create_question(question_in)


@router.post(
    "/upload-image",
    status_code=status.HTTP_200_OK,
    summary="Upload question image (Examiner Only)",
    description="Only accessible by users with the 'examiner' role. Validates image format and limits size to 5MB."
)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker(["examiner", "admin"]))
):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: PNG, JPEG, JPG, GIF, WEBP."
        )

    # Validate Content-Type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type is not supported. Must be an image."
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5MB limit."
        )

    # Validate image magic bytes (signature)
    is_valid_image = False
    if contents.startswith(b"\xff\xd8\xff"):
        is_valid_image = True  # JPEG
    elif contents.startswith(b"\x89PNG\r\n\x1a\n"):
        is_valid_image = True  # PNG
    elif contents.startswith(b"GIF87a") or contents.startswith(b"GIF89a"):
        is_valid_image = True  # GIF
    elif contents.startswith(b"RIFF") and b"WEBP" in contents[8:14]:
        is_valid_image = True  # WEBP

    if not is_valid_image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content signature is not a valid image format. Only JPEG, PNG, GIF, and WEBP images are allowed."
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join("static", "uploads", unique_filename)

    # Save to disk in a non-blocking thread pool
    import anyio
    
    def save_file_sync():
        with open(filepath, "wb") as f:
            f.write(contents)
            
    await anyio.to_thread.run_sync(save_file_sync)

    # Return access URL path
    return {
        "url": f"/static/uploads/{unique_filename}",
        "filename": unique_filename
    }


@router.get(
    "/search",
    response_model=List[QuestionResponse],
    summary="Search questions",
    description="Accessible by any authenticated user. Performs free-text query matching in title or question text."
)
async def search_questions(
    q: str = Query(..., min_length=1, description="Search query string"),
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
    limit: int = Query(100, ge=1, le=500, description="Pagination limit size"),
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_user)
):
    return await question_service.search_questions(search_query=q, skip=skip, limit=limit)


@router.get(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Get Question details",
    description="Accessible by any authenticated user."
)
async def get_question(
    question_id: uuid.UUID,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_user)
):
    return await question_service.get_question(question_id)


@router.get(
    "",
    response_model=List[QuestionResponse],
    summary="List Questions with filtering & sorting",
    description="Accessible by any authenticated user. Filter by subject, type, or difficulty. Sort by created_at, marks, or difficulty."
)
async def list_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    subject_id: Optional[uuid.UUID] = Query(None, description="Filter by Subject ID"),
    question_type: Optional[QuestionType] = Query(None, description="Filter by Question Type"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty ('easy', 'medium', 'hard')"),
    sort_by: str = Query("created_at", description="Sort field ('created_at', 'marks', 'difficulty')"),
    sort_order: str = Query("desc", description="Sort order ('asc', 'desc')"),
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_user)
):
    return await question_service.list_questions(
        skip=skip,
        limit=limit,
        subject_id=subject_id,
        question_type=question_type,
        difficulty=difficulty,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.patch(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Update a Question (Examiner Only)",
    description="Only accessible by users with the 'examiner' role."
)
async def update_question(
    question_id: uuid.UUID,
    question_in: QuestionUpdate,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(RoleChecker(["examiner", "admin"]))
):
    return await question_service.update_question(question_id, question_in)


@router.delete(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Delete a Question (Examiner Only)",
    description="Only accessible by users with the 'examiner' role."
)
async def delete_question(
    question_id: uuid.UUID,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(RoleChecker(["examiner", "admin"]))
):
    return await question_service.delete_question(question_id)


@router.post(
    "/import-pdf",
    status_code=status.HTTP_201_CREATED,
    summary="Import questions from PDF using Groq AI (Examiner Only)",
    description="Extracts raw text from an uploaded PDF, parses it via Groq Llama3, and saves valid questions to the selected subject."
)
async def import_pdf_questions(
    file: UploadFile = File(...),
    subject_id: uuid.UUID = Form(...),
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(RoleChecker(["examiner", "admin"]))
):
    from fastapi import Form
    from app.core.settings import settings
    import io
    import pypdf
    import json

    # Validate extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    # Read PDF contents
    try:
        contents = await file.read()
        reader = pypdf.PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted_text += t + "\n"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The PDF appears to be empty or contains no extractable text."
        )

    # Determine Groq API Key
    api_key = settings.GROQ_API_KEY
    if not api_key or api_key == "your_groq_api_key_here":
        api_key = settings.AI_SERVICE_API_KEY
    if not api_key or api_key == "your_ai_api_key_here":
        import os
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("AI_SERVICE_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Groq API key not configured. Please add GROQ_API_KEY to your environment or .env file."
        )

    # Call Groq API
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        system_prompt = """
        You are an AI Question Bank Parser. Your task is to extract exam questions from the provided raw text of a PDF file.
        You must convert the questions into a structured JSON object containing a "questions" array.
        Ensure 100% accuracy in parsing correct options, titles, question statements, and formatting types.
        
        Format each question in the array as follows:
        - "title": A brief, descriptive title summarizing the question topic (max 50 chars).
        - "question_text": The full question statement.
        - "question_type": Must be one of "mcq", "multi_select", "short_answer", "long_answer".
        - "difficulty": Must be "easy", "medium", or "hard" based on the complexity.
        - "marks": A float value representing the marks (default to 2.0 if not specified in text).
        - "negative_marks": A float value representing negative marks (default to 0.0 if not specified).
        - "options": For "mcq" and "multi_select", an array of option objects each having "option_text" and "is_correct" (boolean).
          * MCQ questions must have exactly one correct option.
          * Multi-Select questions must have at least one correct option.
          * Short/Long Answer questions must have an empty options list.
        - "expected_answer": Optional correct text/explanation details.
        - "explanation": Optional detailed explanation of why the correct option/answer is correct.
        
        Return ONLY a valid JSON object of the form:
        {
          "questions": [
             { ... },
             { ... }
          ]
        }
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Parse the following text:\n\n{extracted_text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        resp_data = json.loads(completion.choices[0].message.content)
        parsed_questions = resp_data.get("questions", [])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Groq API parsing failed: {str(e)}"
        )

    # Insert into Database
    imported_count = 0
    errors = []
    from app.schemas.question import QuestionCreate, QuestionOptionCreate
    
    for idx, q_data in enumerate(parsed_questions):
        try:
            options_create = []
            q_type_str = q_data.get("question_type", "short_answer").lower()
            
            if q_type_str not in ["mcq", "multi_select", "short_answer", "long_answer", "image_upload"]:
                q_type_str = "short_answer"
                
            if q_type_str in ["mcq", "multi_select"] and "options" in q_data:
                for opt in q_data["options"]:
                    options_create.append(QuestionOptionCreate(
                        option_text=opt.get("option_text", ""),
                        is_correct=opt.get("is_correct", False)
                    ))
            
            question_in = QuestionCreate(
                subject_id=subject_id,
                title=q_data.get("title", f"Imported Q{idx+1}"),
                question_text=q_data.get("question_text", ""),
                question_type=QuestionType(q_type_str),
                difficulty=q_data.get("difficulty", "medium").lower(),
                marks=float(q_data.get("marks", 2.0)),
                negative_marks=float(q_data.get("negative_marks", 0.0)),
                options=options_create if options_create else None,
                expected_answer=q_data.get("expected_answer"),
                explanation=q_data.get("explanation")
            )
            await question_service.create_question(question_in)
            imported_count += 1
        except Exception as ex:
            errors.append(f"Question {idx+1} failed: {str(ex)}")

    return {
        "message": f"Successfully processed PDF. Imported {imported_count} of {len(parsed_questions)} questions.",
        "imported_count": imported_count,
        "total_parsed": len(parsed_questions),
        "errors": errors
    }

