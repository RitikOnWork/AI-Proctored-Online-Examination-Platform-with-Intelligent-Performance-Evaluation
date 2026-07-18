import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.subjects import Subject
from app.models.question_bank import QuestionBank, QuestionType, QuestionOptions

DATABASE_URL = "postgresql+asyncpg://postgres:ritik2006@localhost:5432/proctored_exam_db"

async def main():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    subjects_to_add = [
        {"name": "Computer Networks", "desc": "Study of data communications, OSI layers, TCP/IP, and internet protocols."},
        {"name": "Operating Systems", "desc": "Concepts of process control, CPU scheduling, deadlocks, and memory management."},
        {"name": "Data Structures", "desc": "Linear and non-linear data representations including Arrays, Stacks, Trees, and Graphs."}
    ]
    
    questions_data = {
        "Computer Networks": [
            {
                "title": "IP Acronym",
                "text": "What does IP stand for in network terminology?",
                "marks": 2.0,
                "options": [
                    {"text": "Internet Protocol", "correct": True},
                    {"text": "Intranet Pathway", "correct": False},
                    {"text": "Internal Process", "correct": False},
                    {"text": "Information Packet", "correct": False}
                ]
            },
            {
                "title": "OSI HTTP Layer",
                "text": "At which layer of the OSI model does the HTTP protocol operate?",
                "marks": 2.0,
                "options": [
                    {"text": "Application Layer", "correct": True},
                    {"text": "Transport Layer", "correct": False},
                    {"text": "Network Layer", "correct": False},
                    {"text": "Physical Layer", "correct": False}
                ]
            },
            {
                "title": "HTTPS Port",
                "text": "What is the standard port number used for secure HTTP (HTTPS) traffic?",
                "marks": 2.0,
                "options": [
                    {"text": "443", "correct": True},
                    {"text": "80", "correct": False},
                    {"text": "21", "correct": False},
                    {"text": "25", "correct": False}
                ]
            },
            {
                "title": "DNS Purpose",
                "text": "What is the primary function of the Domain Name System (DNS)?",
                "marks": 2.0,
                "options": [
                    {"text": "Translate domain names to IP addresses", "correct": True},
                    {"text": "Filter malicious web content", "correct": False},
                    {"text": "Establish TCP handshake connections", "correct": False},
                    {"text": "Distribute traffic across server clusters", "correct": False}
                ]
            },
            {
                "title": "TCP Protocol Type",
                "text": "Which of the following describes the Transmission Control Protocol (TCP)?",
                "marks": 2.0,
                "options": [
                    {"text": "Connection-oriented protocol", "correct": True},
                    {"text": "Connectionless protocol", "correct": False},
                    {"text": "Broadcasting-only protocol", "correct": False},
                    {"text": "Stateless protocol", "correct": False}
                ]
            }
        ],
        "Operating Systems": [
            {
                "title": "Virtual Memory Purpose",
                "text": "What is the primary goal of Virtual Memory in modern operating systems?",
                "marks": 2.0,
                "options": [
                    {"text": "To allow program execution larger than physical RAM", "correct": True},
                    {"text": "To speed up graphic processing speed", "correct": False},
                    {"text": "To clean database logs automatically", "correct": False},
                    {"text": "To manage remote desktop sync sessions", "correct": False}
                ]
            },
            {
                "title": "Process State",
                "text": "Which of the following is a standard process state in a process life cycle?",
                "marks": 2.0,
                "options": [
                    {"text": "Ready", "correct": True},
                    {"text": "Compiled", "correct": False},
                    {"text": "Zipped", "correct": False},
                    {"text": "Restructured", "correct": False}
                ]
            },
            {
                "title": "Deadlock Definition",
                "text": "What characterizes an Operating System Deadlock?",
                "marks": 2.0,
                "options": [
                    {"text": "Processes are blocked waiting for resources held by each other", "correct": True},
                    {"text": "The computer loses power unexpectedly", "correct": False},
                    {"text": "The memory buffer experiences an overflow", "correct": False},
                    {"text": "A process completes execution successfully", "correct": False}
                ]
            },
            {
                "title": "CPU Scheduling Goal",
                "text": "What does CPU Scheduling decide?",
                "marks": 2.0,
                "options": [
                    {"text": "Which ready process receives CPU allocation next", "correct": True},
                    {"text": "How many page tables are cached in MMU", "correct": False},
                    {"text": "Which files are synced to cloud storage", "correct": False},
                    {"text": "When to turn off system monitors", "correct": False}
                ]
            },
            {
                "title": "FCFS Algorithm Type",
                "text": "Which scheduling algorithm is non-preemptive by default?",
                "marks": 2.0,
                "options": [
                    {"text": "First-Come First-Served (FCFS)", "correct": True},
                    {"text": "Round Robin", "correct": False},
                    {"text": "Shortest Remaining Time First", "correct": False},
                    {"text": "Priority Preemptive", "correct": False}
                ]
            }
        ],
        "Data Structures": [
            {
                "title": "LIFO Structure",
                "text": "Which data structure operates on a Last In First Out (LIFO) access pattern?",
                "marks": 2.0,
                "options": [
                    {"text": "Stack", "correct": True},
                    {"text": "Queue", "correct": False},
                    {"text": "Linked List", "correct": False},
                    {"text": "Binary Tree", "correct": False}
                ]
            },
            {
                "title": "Array Lookup",
                "text": "What is the average time complexity of accessing an array element by its index?",
                "marks": 2.0,
                "options": [
                    {"text": "O(1)", "correct": True},
                    {"text": "O(log n)", "correct": False},
                    {"text": "O(n)", "correct": False},
                    {"text": "O(n log n)", "correct": False}
                ]
            },
            {
                "title": "Linked List Nodes",
                "text": "Which data structure contains node elements that refer directly to the next node sequence?",
                "marks": 2.0,
                "options": [
                    {"text": "Linked List", "correct": True},
                    {"text": "Hash Table", "correct": False},
                    {"text": "Array Stack", "correct": False},
                    {"text": "Adjacency Matrix", "correct": False}
                ]
            },
            {
                "title": "Non-Linear Structure",
                "text": "Which of the following is a non-linear data structure?",
                "marks": 2.0,
                "options": [
                    {"text": "Tree", "correct": True},
                    {"text": "Queue", "correct": False},
                    {"text": "Stack", "correct": False},
                    {"text": "Array", "correct": False}
                ]
            },
            {
                "title": "BST Left Subtree",
                "text": "In a standard Binary Search Tree (BST), elements smaller than the root node are stored where?",
                "marks": 2.0,
                "options": [
                    {"text": "Left subtree", "correct": True},
                    {"text": "Right subtree", "correct": False},
                    {"text": "Leaves only", "correct": False},
                    {"text": "Direct root pointers", "correct": False}
                ]
            }
        ]
    }
    
    async with async_session() as session:
        async with session.begin():
            # Seed subjects
            subject_map = {}
            for sub_data in subjects_to_add:
                # Check if subject already exists
                stmt = select(Subject).where(Subject.name == sub_data["name"])
                res = await session.execute(stmt)
                subj = res.scalar_one_or_none()
                
                if not subj:
                    subj = Subject(
                        id=uuid.uuid4(),
                        name=sub_data["name"],
                        description=sub_data["desc"]
                    )
                    session.add(subj)
                    print(f"Creating Subject: {sub_data['name']}")
                else:
                    print(f"Subject already exists: {sub_data['name']}")
                
                subject_map[sub_data["name"]] = subj
            
            await session.flush()
            
            # Seed questions
            for subj_name, q_list in questions_data.items():
                subj = subject_map[subj_name]
                for q_data in q_list:
                    # Check if question title already exists for this subject
                    stmt = select(QuestionBank).where(
                        QuestionBank.title == q_data["title"],
                        QuestionBank.subject_id == subj.id
                    )
                    res = await session.execute(stmt)
                    exist_q = res.scalar_one_or_none()
                    
                    if not exist_q:
                        q_obj = QuestionBank(
                            id=uuid.uuid4(),
                            subject_id=subj.id,
                            title=q_data["title"],
                            question_text=q_data["text"],
                            question_type=QuestionType.MCQ,
                            difficulty="easy",
                            marks=q_data["marks"],
                            negative_marks=0.0
                        )
                        session.add(q_obj)
                        print(f"Adding question: {q_data['title']}")
                        
                        await session.flush()
                        
                        # Add options
                        for opt_data in q_data["options"]:
                            opt_obj = QuestionOptions(
                                id=uuid.uuid4(),
                                question_id=q_obj.id,
                                option_text=opt_data["text"],
                                is_correct=opt_data["correct"]
                            )
                            session.add(opt_obj)
                    else:
                        print(f"Question already exists: {q_data['title']}")
            
            await session.commit()
            print("Successfully finished seeding questions!")

if __name__ == "__main__":
    asyncio.run(main())
