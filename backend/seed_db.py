import asyncio
import uuid
import datetime
import bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete, text
from app.models.users import User, UserRole
from app.models.subjects import Subject
from app.models.question_bank import QuestionBank, QuestionType
from app.models.exams import Exam, ExamQuestion
from app.models.exam_sessions import ExamSession, SessionStatus
from app.models.proctor_events import ProctorEvent, ProctorEventType
from app.models.results import Result

DATABASE_URL = "postgresql+asyncpg://postgres:ritik2006@localhost:5432/proctored_exam_db"

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

async def main():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        async with session.begin():
            print("Cleaning up old mock data...")
            # Keep the admin@proctorai.com user if they exist, delete others
            await session.execute(delete(Result))
            await session.execute(delete(ProctorEvent))
            await session.execute(delete(ExamSession))
            await session.execute(delete(ExamQuestion))
            await session.execute(delete(Exam))
            await session.execute(delete(QuestionBank))
            await session.execute(delete(Subject))
            await session.execute(delete(User).where(User.email != "admin@proctorai.com"))
            
            print("Seeding subjects...")
            subjects_data = [
                {"name": "Mathematics", "description": "Algebra, Calculus, and Geometry"},
                {"name": "Physics", "description": "Classical Mechanics, Electromagnetism, and Optics"},
                {"name": "Chemistry", "description": "Organic, Inorganic, and Physical Chemistry"},
                {"name": "Biology", "description": "Genetics, Ecology, and Human Physiology"},
                {"name": "Computer Science", "description": "Algorithms, Data Structures, and Software Engineering"},
                {"name": "English", "description": "Grammar, Literature, and Writing"},
                {"name": "History", "description": "World History and Archaeology"},
            ]
            subjects = []
            for sd in subjects_data:
                sub = Subject(id=uuid.uuid4(), name=sd["name"], description=sd["description"])
                session.add(sub)
                subjects.append(sub)
            
            # Flush so we have subject IDs
            await session.flush()
            
            print("Seeding users (students, examiners)...")
            hashed_pwd = hash_password("password123")
            
            # Get admin user ID
            admin_result = await session.execute(select(User).where(User.email == "admin@proctorai.com"))
            admin_user = admin_result.scalar_one_or_none()
            if not admin_user:
                admin_user = User(
                    id=uuid.uuid4(),
                    email="admin@proctorai.com",
                    hashed_password=hash_password("admin@123"),
                    full_name="System Administrator",
                    role=UserRole.ADMIN,
                    is_active=True
                )
                session.add(admin_user)
                await session.flush()
            
            # Add examiners
            examiners = [
                User(id=uuid.uuid4(), email="rkumar@example.com", hashed_password=hashed_pwd, full_name="Dr. Rajesh Kumar", role=UserRole.EXAMINER, is_active=True),
                User(id=uuid.uuid4(), email="amehta@example.com", hashed_password=hashed_pwd, full_name="Prof. Anita Mehta", role=UserRole.EXAMINER, is_active=True),
                User(id=uuid.uuid4(), email="sjoshi@example.com", hashed_password=hashed_pwd, full_name="Dr. Sunil Joshi", role=UserRole.EXAMINER, is_active=True)
            ]
            for ex in examiners:
                session.add(ex)
                
            # Add students
            students = [
                User(id=uuid.uuid4(), email="priya@example.com", hashed_password=hashed_pwd, full_name="Priya Sharma", role=UserRole.STUDENT, is_active=True),
                User(id=uuid.uuid4(), email="rahul@example.com", hashed_password=hashed_pwd, full_name="Rahul Verma", role=UserRole.STUDENT, is_active=True),
                User(id=uuid.uuid4(), email="ananya@example.com", hashed_password=hashed_pwd, full_name="Ananya Singh", role=UserRole.STUDENT, is_active=True),
                User(id=uuid.uuid4(), email="vikram@example.com", hashed_password=hashed_pwd, full_name="Vikram Nair", role=UserRole.STUDENT, is_active=True),
                User(id=uuid.uuid4(), email="sneha@example.com", hashed_password=hashed_pwd, full_name="Sneha Pillai", role=UserRole.STUDENT, is_active=True),
                User(id=uuid.uuid4(), email="arjun@example.com", hashed_password=hashed_pwd, full_name="Arjun Kumar", role=UserRole.STUDENT, is_active=True)
            ]
            for st in students:
                session.add(st)
                
            await session.flush()
            
            print("Seeding question bank...")
            questions_data = [
                # Math
                {"subject": "Mathematics", "title": "Calculus Derivative", "text": "What is the derivative of x^2 + 3x + 5 with respect to x?", "type": QuestionType.SHORT_ANSWER, "difficulty": "medium", "marks": 5.0},
                {"subject": "Mathematics", "title": "Prime Numbers MCQ", "text": "Which of the following is a prime number?", "type": QuestionType.MCQ, "difficulty": "easy", "marks": 2.0},
                # Physics
                {"subject": "Physics", "title": "Newton Laws Long Answer", "text": "Explain Newton's three laws of motion with examples.", "type": QuestionType.LONG_ANSWER, "difficulty": "hard", "marks": 10.0},
                {"subject": "Physics", "title": "Speed of Light MCQ", "text": "What is the approximate speed of light in a vacuum?", "type": QuestionType.MCQ, "difficulty": "easy", "marks": 2.0},
                # CS
                {"subject": "Computer Science", "title": "Binary Tree Height", "text": "Write a recursive function to find the height of a binary tree.", "type": QuestionType.LONG_ANSWER, "difficulty": "hard", "marks": 10.0},
                {"subject": "Computer Science", "title": "HTTP Status Code MCQ", "text": "Which HTTP status code represents 'Unauthorized'?", "type": QuestionType.MCQ, "difficulty": "easy", "marks": 2.0},
                {"subject": "Computer Science", "title": "SQL Join Types", "text": "Select all valid SQL JOIN types.", "type": QuestionType.MULTI_SELECT, "difficulty": "medium", "marks": 4.0},
                {"subject": "Computer Science", "title": "Upload Code Screenshot", "text": "Upload a screenshot of your clean code for the sorting algorithm.", "type": QuestionType.IMAGE_UPLOAD, "difficulty": "medium", "marks": 5.0}
            ]
            
            questions = []
            subject_map = {s.name: s.id for s in subjects}
            for qd in questions_data:
                sub_id = subject_map[qd["subject"]]
                q = QuestionBank(
                    id=uuid.uuid4(),
                    subject_id=sub_id,
                    title=qd["title"],
                    question_text=qd["text"],
                    question_type=qd["type"],
                    difficulty=qd["difficulty"],
                    marks=qd["marks"]
                )
                session.add(q)
                questions.append(q)
                
            await session.flush()
            
            print("Seeding exams...")
            now = datetime.datetime.now(datetime.timezone.utc)
            exams_data = [
                {"title": "Advanced Mathematics Mid-Term", "subject": "Mathematics", "creator": examiners[0], "duration": 120, "passing": 40, "start": now - datetime.timedelta(days=2), "end": now + datetime.timedelta(days=2), "published": True},
                {"title": "Physics Final Examination", "subject": "Physics", "creator": examiners[1], "duration": 180, "passing": 50, "start": now + datetime.timedelta(days=5), "end": now + datetime.timedelta(days=5, hours=3), "published": True},
                {"title": "Computer Science Practical", "subject": "Computer Science", "creator": examiners[2], "duration": 90, "passing": 45, "start": now - datetime.timedelta(days=5), "end": now - datetime.timedelta(days=5, hours=-2), "published": True},
                {"title": "Chemistry Quiz (Draft)", "subject": "Chemistry", "creator": examiners[1], "duration": 45, "passing": 20, "start": None, "end": None, "published": False}
            ]
            
            exams = []
            for ed in exams_data:
                exam = Exam(
                    id=uuid.uuid4(),
                    title=ed["title"],
                    description=f"Evaluation exam for {ed['subject']}.",
                    subject_id=subject_map[ed["subject"]],
                    creator_id=ed["creator"].id,
                    duration_minutes=ed["duration"],
                    passing_score=ed["passing"],
                    start_time=ed["start"],
                    end_time=ed["end"],
                    is_published=ed["published"]
                )
                session.add(exam)
                exams.append(exam)
                
            await session.flush()
            
            # Associate questions to exams
            print("Associating questions to exams...")
            # CS Exam questions
            cs_exam = exams[2]
            cs_questions = [q for q in questions if q.subject_id == subject_map["Computer Science"]]
            for idx, cq in enumerate(cs_questions):
                eq = ExamQuestion(
                    exam_id=cs_exam.id,
                    question_id=cq.id,
                    order=idx + 1
                )
                session.add(eq)
                
            # Math Exam questions
            math_exam = exams[0]
            math_questions = [q for q in questions if q.subject_id == subject_map["Mathematics"]]
            for idx, mq in enumerate(math_questions):
                eq = ExamQuestion(
                    exam_id=math_exam.id,
                    question_id=mq.id,
                    order=idx + 1
                )
                session.add(eq)
                
            await session.flush()
            
            print("Seeding exam sessions...")
            sessions_data = [
                # Active
                {"exam": exams[0], "candidate": students[0], "status": SessionStatus.ACTIVE, "started": now - datetime.timedelta(minutes=30), "completed": None},
                # Submitted & needs evaluation
                {"exam": exams[2], "candidate": students[1], "status": SessionStatus.SUBMITTED, "started": now - datetime.timedelta(days=5, minutes=10), "completed": now - datetime.timedelta(days=5, hours=-1)},
                # Graded
                {"exam": exams[2], "candidate": students[2], "status": SessionStatus.SUBMITTED, "started": now - datetime.timedelta(days=5, minutes=50), "completed": now - datetime.timedelta(days=5, hours=-2)},
                # Suspended due to excessive flags
                {"exam": exams[0], "candidate": students[3], "status": SessionStatus.SUSPENDED, "started": now - datetime.timedelta(minutes=45), "completed": None}
            ]
            
            sessions = []
            for sd in sessions_data:
                sess = ExamSession(
                    id=uuid.uuid4(),
                    exam_id=sd["exam"].id,
                    candidate_id=sd["candidate"].id,
                    status=sd["status"],
                    started_at=sd["started"],
                    completed_at=sd["completed"],
                    ip_address="192.168.1.55",
                    device_info="Chrome 122 / Windows 11"
                )
                session.add(sess)
                sessions.append(sess)
                
            await session.flush()
            
            print("Seeding proctor events...")
            # Add some events for the suspended session (Vikram Nair - index 3)
            events = [
                ProctorEvent(
                    id=uuid.uuid4(),
                    session_id=sessions[3].id,
                    event_type=ProctorEventType.TAB_SWITCHED,
                    confidence=1.00,
                    timestamp=now - datetime.timedelta(minutes=40),
                    details="Switched to external resource"
                ),
                ProctorEvent(
                    id=uuid.uuid4(),
                    session_id=sessions[3].id,
                    event_type=ProctorEventType.MULTIPLE_FACES,
                    confidence=0.88,
                    timestamp=now - datetime.timedelta(minutes=35),
                    details="Second person detected in webcam view"
                ),
                # Also add one minor event for Priya (active session)
                ProctorEvent(
                    id=uuid.uuid4(),
                    session_id=sessions[0].id,
                    event_type=ProctorEventType.FACE_MISSING,
                    confidence=0.95,
                    timestamp=now - datetime.timedelta(minutes=10),
                    details="Webcam blocked or user looked away"
                ),
                # Add multiple events for Rahul Verma's submitted session (index 1)
                ProctorEvent(
                    id=uuid.uuid4(),
                    session_id=sessions[1].id,
                    event_type=ProctorEventType.TAB_SWITCHED,
                    confidence=1.00,
                    timestamp=now - datetime.timedelta(days=5, minutes=-20),
                    details="Browser tab focus lost twice"
                )
            ]
            for ev in events:
                session.add(ev)
                
            await session.flush()
            
            print("Seeding results...")
            res = Result(
                id=uuid.uuid4(),
                session_id=sessions[2].id,
                total_score=85.00,
                percentage=85.00,
                is_passed=True,
                graded_by=examiners[2].id,
                feedback="Excellent sorting implementation and detailed explanation."
            )
            session.add(res)
            
    print("Database seeding completed successfully!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
