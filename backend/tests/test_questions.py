import pytest
import uuid
from app.models.question_bank import QuestionType

pytestmark = pytest.mark.asyncio


async def test_question_crud_and_search(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")

    # 1. Admin creates subject
    res = await client.post("/api/v1/subjects", json={"name": f"CS_{uuid.uuid4().hex[:6]}", "description": "Subject test"}, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 201
    subject_id = res.json()["id"]

    # 2. Examiner creates question with options
    q_payload = {
        "title": "Algorithms 101",
        "question_text": "What is the complexity of Merge Sort?",
        "question_type": "mcq",
        "subject_id": subject_id,
        "options": [
            {"option_text": "O(N log N)", "is_correct": True},
            {"option_text": "O(N^2)", "is_correct": False}
        ],
        "difficulty": "medium",
        "marks": 3.0
    }
    res = await client.post("/api/v1/questions", json=q_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 201
    q_id = res.json()["id"]

    # 3. Get question by ID
    res = await client.get(f"/api/v1/questions/{q_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert res.json()["title"] == "Algorithms 101"

    # 4. Search question (valid match)
    res = await client.get("/api/v1/questions/search?q=Algorithms", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 5. Search question (empty/whitespace match should fail 400)
    res = await client.get("/api/v1/questions/search?q=   ", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 400

    # 6. List questions with subject and difficulty filters
    res = await client.get(f"/api/v1/questions?subject_id={subject_id}&question_type=mcq&difficulty=medium", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert len(res.json()) == 1

    # 7. Update question (modify difficulty, marks and update options)
    update_payload = {
        "difficulty": "hard",
        "marks": 4.0,
        "options": [
            {"option_text": "O(N log N)", "is_correct": True},
            {"option_text": "O(N^2)", "is_correct": False},
            {"option_text": "O(N)", "is_correct": False}
        ]
    }
    res = await client.patch(f"/api/v1/questions/{q_id}", json=update_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert res.json()["difficulty"] == "hard"
    assert len(res.json()["options"]) == 3

    # 8. Delete question
    res = await client.delete(f"/api/v1/questions/{q_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200

    # 9. Get deleted question (Should fail 404)
    res = await client.get(f"/api/v1/questions/{q_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 404


async def test_image_upload(client, create_token):
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")

    # 1. Valid image upload
    files = {"file": ("test.png", b"\x89PNG\r\n\x1a\nfake-image-bytes", "image/png")}
    res = await client.post(
        "/api/v1/questions/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {examiner_token}"}
    )
    assert res.status_code == 200
    assert "url" in res.json()
    assert res.json()["url"].startswith("/static/uploads/")

    # 2. Invalid file format
    files = {"file": ("test.txt", b"some text", "text/plain")}
    res = await client.post(
        "/api/v1/questions/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {examiner_token}"}
    )
    assert res.status_code == 400

    # 3. Oversized file
    oversized_data = b"\x89PNG\r\n\x1a\n" + b"x" * (5 * 1024 * 1024 + 10)
    files = {"file": ("large.png", oversized_data, "image/png")}
    res = await client.post(
        "/api/v1/questions/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {examiner_token}"}
    )
    assert res.status_code == 400


async def test_import_pdf_questions(client, create_token, db_session):
    from unittest.mock import patch, MagicMock
    from app.models.subjects import Subject

    # 1. Create a subject in database first so we have a valid subject_id
    subject = Subject(name="AI Engineering", description="Artificial Intelligence")
    db_session.add(subject)
    await db_session.commit()
    await db_session.refresh(subject)
    
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")
    
    # 2. Prepare mock PDF file and mock groq/pypdf calls
    pdf_data = b"%PDF-1.4 mock pdf contents"
    
    mock_pdf_reader = MagicMock()
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Mock question text from PDF"
    mock_pdf_reader.pages = [mock_page]
    
    mock_groq_client = MagicMock()
    mock_completion = MagicMock()
    mock_message = MagicMock()
    
    # Target JSON format that Groq will return
    mock_message.content = """
    {
      "questions": [
        {
          "title": "Mocked MCQ Q1",
          "question_text": "What is the capital of France?",
          "question_type": "mcq",
          "difficulty": "easy",
          "marks": 2.0,
          "options": [
            { "option_text": "Paris", "is_correct": true },
            { "option_text": "London", "is_correct": false }
          ]
        }
      ]
    }
    """
    mock_completion.choices = [MagicMock(message=mock_message)]
    mock_groq_client.chat.completions.create.return_value = mock_completion
    
    # Apply patches and post import request
    with patch("pypdf.PdfReader", return_value=mock_pdf_reader), \
         patch("groq.Groq", return_value=mock_groq_client), \
         patch.dict("os.environ", {"GROQ_API_KEY": "mock-groq-key"}):
         
        files = {"file": ("test.pdf", pdf_data, "application/pdf")}
        data = {"subject_id": str(subject.id)}
        
        res = await client.post(
            "/api/v1/questions/import-pdf",
            files=files,
            data=data,
            headers={"Authorization": f"Bearer {examiner_token}"}
        )
        
        assert res.status_code == 201
        json_data = res.json()
        assert json_data["imported_count"] == 1
        assert json_data["total_parsed"] == 1
        assert "Successfully processed PDF" in json_data["message"]

