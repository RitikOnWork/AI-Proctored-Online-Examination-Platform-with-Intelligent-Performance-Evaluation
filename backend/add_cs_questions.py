"""
add_cs_questions.py
-------------------
Seeds 5 easy-level MCQ questions into the question bank for each of the
following CS subjects:
  1. Computer Networks
  2. Operating Systems
  3. Data Structures
  4. Database Management Systems (DBMS)
  5. Software Engineering

Run from the backend/ directory:
    python add_cs_questions.py
"""

import asyncio
import uuid

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.models.subjects import Subject
from app.models.question_bank import QuestionBank, QuestionType, QuestionOptions

DATABASE_URL = "postgresql+asyncpg://postgres:ritik2006@localhost:5432/proctored_exam_db"

# ---------------------------------------------------------------------------
# Subject definitions
# ---------------------------------------------------------------------------
SUBJECTS_TO_ADD = [
    {
        "name": "Computer Networks",
        "desc": "Study of data communications, OSI layers, TCP/IP, and internet protocols.",
    },
    {
        "name": "Operating Systems",
        "desc": "Concepts of process control, CPU scheduling, deadlocks, and memory management.",
    },
    {
        "name": "Data Structures",
        "desc": "Linear and non-linear data representations including Arrays, Stacks, Trees, and Graphs.",
    },
    {
        "name": "Database Management Systems",
        "desc": "Relational database concepts, SQL, normalization, transactions, and indexing.",
    },
    {
        "name": "Software Engineering",
        "desc": "SDLC models, software design principles, testing methodologies, and project management.",
    },
]

# ---------------------------------------------------------------------------
# Question bank  –  5 easy MCQ questions per subject
# ---------------------------------------------------------------------------
QUESTIONS_DATA = {
    # ------------------------------------------------------------------ #
    # 1. COMPUTER NETWORKS                                                #
    # ------------------------------------------------------------------ #
    "Computer Networks": [
        {
            "title": "CN – IP Acronym",
            "text": "What does 'IP' stand for in the context of computer networking?",
            "explanation": "IP stands for Internet Protocol, the foundational protocol for routing packets across interconnected networks.",
            "options": [
                {"text": "Internet Protocol",  "correct": True},
                {"text": "Intranet Pathway",   "correct": False},
                {"text": "Internal Process",   "correct": False},
                {"text": "Information Packet", "correct": False},
            ],
        },
        {
            "title": "CN – OSI HTTP Layer",
            "text": "At which layer of the OSI model does the HTTP protocol operate?",
            "explanation": "HTTP is an application-layer protocol (Layer 7 of the OSI model) used for communication between web clients and servers.",
            "options": [
                {"text": "Application Layer", "correct": True},
                {"text": "Transport Layer",   "correct": False},
                {"text": "Network Layer",     "correct": False},
                {"text": "Physical Layer",    "correct": False},
            ],
        },
        {
            "title": "CN – HTTPS Port",
            "text": "What is the default port number for HTTPS (secure HTTP) traffic?",
            "explanation": "HTTPS uses port 443 by default, while plain HTTP uses port 80.",
            "options": [
                {"text": "443", "correct": True},
                {"text": "80",  "correct": False},
                {"text": "21",  "correct": False},
                {"text": "25",  "correct": False},
            ],
        },
        {
            "title": "CN – DNS Purpose",
            "text": "What is the primary function of the Domain Name System (DNS)?",
            "explanation": "DNS translates human-readable domain names (e.g., google.com) into machine-readable IP addresses.",
            "options": [
                {"text": "Translate domain names to IP addresses",  "correct": True},
                {"text": "Filter malicious web content",            "correct": False},
                {"text": "Establish TCP handshake connections",     "correct": False},
                {"text": "Distribute traffic across server clusters","correct": False},
            ],
        },
        {
            "title": "CN – TCP Connection Type",
            "text": "Which statement best describes the Transmission Control Protocol (TCP)?",
            "explanation": "TCP is a connection-oriented, reliable protocol that ensures ordered delivery of data between endpoints using a three-way handshake.",
            "options": [
                {"text": "Connection-oriented, reliable protocol",      "correct": True},
                {"text": "Connectionless, best-effort protocol",        "correct": False},
                {"text": "Broadcasting-only protocol",                  "correct": False},
                {"text": "Stateless, fire-and-forget protocol",         "correct": False},
            ],
        },
    ],

    # ------------------------------------------------------------------ #
    # 2. OPERATING SYSTEMS                                                #
    # ------------------------------------------------------------------ #
    "Operating Systems": [
        {
            "title": "OS – Virtual Memory Purpose",
            "text": "What is the primary goal of Virtual Memory in modern operating systems?",
            "explanation": "Virtual Memory allows a program to use more address space than physically available RAM by swapping data between RAM and disk storage.",
            "options": [
                {"text": "Allow programs to execute even when larger than physical RAM", "correct": True},
                {"text": "Speed up GPU-based graphic processing",                        "correct": False},
                {"text": "Automatically clean stale database logs",                     "correct": False},
                {"text": "Synchronize remote desktop sessions",                          "correct": False},
            ],
        },
        {
            "title": "OS – Process State",
            "text": "Which of the following is a valid state in the standard process life cycle?",
            "explanation": "Standard process states include New, Ready, Running, Waiting/Blocked, and Terminated.",
            "options": [
                {"text": "Ready",        "correct": True},
                {"text": "Compiled",     "correct": False},
                {"text": "Zipped",       "correct": False},
                {"text": "Restructured", "correct": False},
            ],
        },
        {
            "title": "OS – Deadlock Definition",
            "text": "What best characterizes an Operating System deadlock?",
            "explanation": "A deadlock is a situation where two or more processes are blocked indefinitely, each waiting for a resource held by another process in the same set.",
            "options": [
                {"text": "Processes blocked waiting for resources held by each other", "correct": True},
                {"text": "The computer loses power unexpectedly",                      "correct": False},
                {"text": "A memory buffer experiences an overflow error",             "correct": False},
                {"text": "A process completes its execution successfully",             "correct": False},
            ],
        },
        {
            "title": "OS – CPU Scheduling Decision",
            "text": "What does the CPU Scheduler (also called short-term scheduler) decide?",
            "explanation": "The CPU scheduler selects which process in the Ready queue gets to use the CPU next.",
            "options": [
                {"text": "Which ready process receives CPU allocation next",  "correct": True},
                {"text": "How many page tables are cached in the MMU",        "correct": False},
                {"text": "Which files are synced to cloud storage",           "correct": False},
                {"text": "When to power off system monitors",                 "correct": False},
            ],
        },
        {
            "title": "OS – FCFS Non-Preemptive",
            "text": "Which of the following CPU scheduling algorithms is non-preemptive by default?",
            "explanation": "First-Come First-Served (FCFS) is non-preemptive: once a process gets the CPU it runs to completion unless it voluntarily blocks.",
            "options": [
                {"text": "First-Come First-Served (FCFS)",     "correct": True},
                {"text": "Round Robin",                        "correct": False},
                {"text": "Shortest Remaining Time First",     "correct": False},
                {"text": "Priority Preemptive Scheduling",    "correct": False},
            ],
        },
    ],

    # ------------------------------------------------------------------ #
    # 3. DATA STRUCTURES                                                  #
    # ------------------------------------------------------------------ #
    "Data Structures": [
        {
            "title": "DS – LIFO Structure",
            "text": "Which data structure operates on a Last-In First-Out (LIFO) access pattern?",
            "explanation": "A Stack follows the LIFO principle: the most recently pushed element is the first one to be popped.",
            "options": [
                {"text": "Stack",       "correct": True},
                {"text": "Queue",       "correct": False},
                {"text": "Linked List", "correct": False},
                {"text": "Binary Tree", "correct": False},
            ],
        },
        {
            "title": "DS – Array Access Complexity",
            "text": "What is the time complexity of accessing an element in an array by its index?",
            "explanation": "Array index access is O(1) (constant time) because elements are stored at contiguous memory addresses calculated directly from the index.",
            "options": [
                {"text": "O(1)",       "correct": True},
                {"text": "O(log n)",   "correct": False},
                {"text": "O(n)",       "correct": False},
                {"text": "O(n log n)", "correct": False},
            ],
        },
        {
            "title": "DS – Linked List Characteristic",
            "text": "Which data structure stores elements where each node holds a reference (pointer) to the next node?",
            "explanation": "In a Linked List, each node contains data and a pointer to the next node, forming a chain. There is no requirement for contiguous memory.",
            "options": [
                {"text": "Linked List",      "correct": True},
                {"text": "Hash Table",       "correct": False},
                {"text": "Array",            "correct": False},
                {"text": "Adjacency Matrix", "correct": False},
            ],
        },
        {
            "title": "DS – Non-Linear Structure",
            "text": "Which of the following is a non-linear data structure?",
            "explanation": "A Tree is non-linear because elements are arranged in a parent-child hierarchy rather than a sequential order.",
            "options": [
                {"text": "Tree",   "correct": True},
                {"text": "Queue",  "correct": False},
                {"text": "Stack",  "correct": False},
                {"text": "Array",  "correct": False},
            ],
        },
        {
            "title": "DS – BST Left Subtree",
            "text": "In a Binary Search Tree (BST), where are elements smaller than the root stored?",
            "explanation": "In a BST, all nodes with values less than the root are placed in its left subtree, and all greater values in the right subtree.",
            "options": [
                {"text": "Left subtree",        "correct": True},
                {"text": "Right subtree",       "correct": False},
                {"text": "In leaf nodes only",  "correct": False},
                {"text": "Directly at the root","correct": False},
            ],
        },
    ],

    # ------------------------------------------------------------------ #
    # 4. DATABASE MANAGEMENT SYSTEMS                                      #
    # ------------------------------------------------------------------ #
    "Database Management Systems": [
        {
            "title": "DBMS – SQL SELECT Purpose",
            "text": "Which SQL statement is used to retrieve data from a database table?",
            "explanation": "The SELECT statement is the primary SQL command for querying and retrieving rows from one or more tables.",
            "options": [
                {"text": "SELECT", "correct": True},
                {"text": "INSERT", "correct": False},
                {"text": "UPDATE", "correct": False},
                {"text": "DELETE", "correct": False},
            ],
        },
        {
            "title": "DBMS – Primary Key Constraint",
            "text": "What is the main property of a PRIMARY KEY in a relational database?",
            "explanation": "A PRIMARY KEY uniquely identifies every row in a table. It cannot be NULL and must be unique across all rows.",
            "options": [
                {"text": "It uniquely identifies each row and cannot be NULL",   "correct": True},
                {"text": "It stores only numeric data types",                    "correct": False},
                {"text": "It allows duplicate values for faster indexing",       "correct": False},
                {"text": "It links two tables using a foreign reference",        "correct": False},
            ],
        },
        {
            "title": "DBMS – DDL vs DML",
            "text": "Which of the following SQL commands belongs to the Data Definition Language (DDL) category?",
            "explanation": "DDL commands define or modify database schema. CREATE is DDL. SELECT, INSERT, and UPDATE are DML (Data Manipulation Language).",
            "options": [
                {"text": "CREATE TABLE", "correct": True},
                {"text": "SELECT",       "correct": False},
                {"text": "INSERT INTO",  "correct": False},
                {"text": "UPDATE",       "correct": False},
            ],
        },
        {
            "title": "DBMS – Normalization Goal",
            "text": "What is the primary purpose of normalization in database design?",
            "explanation": "Normalization reduces data redundancy and ensures data integrity by organizing data into tables and relationships following specific normal forms.",
            "options": [
                {"text": "Reduce data redundancy and eliminate update anomalies", "correct": True},
                {"text": "Increase the number of tables for faster queries",      "correct": False},
                {"text": "Encrypt sensitive columns automatically",               "correct": False},
                {"text": "Compress the database to save storage space",           "correct": False},
            ],
        },
        {
            "title": "DBMS – ACID Atomicity",
            "text": "In database transactions, what does the 'A' in ACID stand for?",
            "explanation": "ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures that all operations within a transaction are completed fully or not at all.",
            "options": [
                {"text": "Atomicity",      "correct": True},
                {"text": "Availability",   "correct": False},
                {"text": "Authorization",  "correct": False},
                {"text": "Accessibility",  "correct": False},
            ],
        },
    ],

    # ------------------------------------------------------------------ #
    # 5. SOFTWARE ENGINEERING                                             #
    # ------------------------------------------------------------------ #
    "Software Engineering": [
        {
            "title": "SE – SDLC Full Form",
            "text": "What does the acronym SDLC stand for in Software Engineering?",
            "explanation": "SDLC stands for Software Development Life Cycle, a structured process for planning, creating, testing, and deploying software.",
            "options": [
                {"text": "Software Development Life Cycle",    "correct": True},
                {"text": "System Design and Language Control", "correct": False},
                {"text": "Software Debugging and Log Check",  "correct": False},
                {"text": "System Deployment Launch Cycle",    "correct": False},
            ],
        },
        {
            "title": "SE – Agile Core Value",
            "text": "Which of the following best represents a core principle of the Agile methodology?",
            "explanation": "Agile values iterative development with frequent releases, continuous customer collaboration, and the ability to respond to change over rigid planning.",
            "options": [
                {"text": "Iterative development with continuous customer collaboration", "correct": True},
                {"text": "Extensive upfront documentation before coding begins",         "correct": False},
                {"text": "A single fixed release after all features are complete",       "correct": False},
                {"text": "Avoiding testing until the final product is ready",            "correct": False},
            ],
        },
        {
            "title": "SE – Black-Box Testing",
            "text": "Which type of software testing focuses on testing functionality without knowledge of internal code structure?",
            "explanation": "Black-box testing evaluates software purely based on its inputs and expected outputs, without examining the internal logic or source code.",
            "options": [
                {"text": "Black-box Testing", "correct": True},
                {"text": "White-box Testing", "correct": False},
                {"text": "Unit Testing",      "correct": False},
                {"text": "Regression Testing","correct": False},
            ],
        },
        {
            "title": "SE – Version Control Purpose",
            "text": "What is the primary purpose of a Version Control System (VCS) such as Git?",
            "explanation": "A VCS tracks changes to source code over time, allowing developers to collaborate, revert to previous states, and manage parallel branches of development.",
            "options": [
                {"text": "Track code changes and support collaborative development", "correct": True},
                {"text": "Automatically deploy code to production servers",          "correct": False},
                {"text": "Compile source code into machine-readable binaries",       "correct": False},
                {"text": "Monitor server uptime and alert on failures",              "correct": False},
            ],
        },
        {
            "title": "SE – Waterfall Model Characteristic",
            "text": "Which characteristic best describes the Waterfall software development model?",
            "explanation": "The Waterfall model is a sequential, linear process where each phase (Requirements → Design → Implementation → Testing → Deployment) must be completed before the next begins.",
            "options": [
                {"text": "Sequential, linear phases with no iteration",                  "correct": True},
                {"text": "Continuous iteration in short time-boxed sprints",             "correct": False},
                {"text": "Parallel development with multiple independent teams",         "correct": False},
                {"text": "Prototype-first approach with heavy customer involvement",     "correct": False},
            ],
        },
    ],
}


# ---------------------------------------------------------------------------
# Main seeding routine
# ---------------------------------------------------------------------------
async def main() -> None:
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        async with session.begin():

            # ---- 1. Ensure all subjects exist --------------------------------
            subject_map: dict[str, Subject] = {}
            for sub_data in SUBJECTS_TO_ADD:
                stmt = select(Subject).where(Subject.name == sub_data["name"])
                res = await session.execute(stmt)
                subj = res.scalar_one_or_none()

                if not subj:
                    subj = Subject(
                        id=uuid.uuid4(),
                        name=sub_data["name"],
                        description=sub_data["desc"],
                    )
                    session.add(subj)
                    print(f"  [NEW]    Subject -> {sub_data['name']}")
                else:
                    print(f"  [EXIST]  Subject -> {sub_data['name']}")

                subject_map[sub_data["name"]] = subj

            await session.flush()  # ensure subject IDs are populated

            # ---- 2. Seed questions -------------------------------------------
            total_added = 0
            total_skipped = 0

            for subj_name, q_list in QUESTIONS_DATA.items():
                subj = subject_map[subj_name]
                print(f"\n  Subject: {subj_name}")

                for q_data in q_list:
                    # Idempotency check – skip if title already exists for subject
                    stmt = select(QuestionBank).where(
                        QuestionBank.title == q_data["title"],
                        QuestionBank.subject_id == subj.id,
                    )
                    res = await session.execute(stmt)
                    existing = res.scalar_one_or_none()

                    if existing:
                        print(f"    [SKIP]   {q_data['title']}")
                        total_skipped += 1
                        continue

                    q_obj = QuestionBank(
                        id=uuid.uuid4(),
                        subject_id=subj.id,
                        title=q_data["title"],
                        question_text=q_data["text"],
                        question_type=QuestionType.MCQ,
                        difficulty="easy",
                        marks=2.0,
                        negative_marks=0.0,
                        explanation=q_data.get("explanation"),
                    )
                    session.add(q_obj)
                    await session.flush()  # get q_obj.id before options

                    for opt_data in q_data["options"]:
                        opt_obj = QuestionOptions(
                            id=uuid.uuid4(),
                            question_id=q_obj.id,
                            option_text=opt_data["text"],
                            is_correct=opt_data["correct"],
                        )
                        session.add(opt_obj)

                    print(f"    [ADD]    {q_data['title']}")
                    total_added += 1

        print(
            f"\n  Seeding complete -- {total_added} question(s) added, "
            f"{total_skipped} skipped (already exist)."
        )

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
