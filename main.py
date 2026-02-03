from dotenv import load_dotenv
from datetime import datetime, timedelta
import os
import logging
from pathlib import Path

# 1️⃣ Load environment variables from the SAME directory as this file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

import json
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google.oauth2 import service_account
from googleapiclient.discovery import build
from pymongo import MongoClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("classroom-backend")

# 2️⃣ Read MongoDB URI strictly
MONGODB_URI = os.getenv("MONGODB_URI")

def get_masked_uri(uri: str) -> str:
    """Masks credentials in the MongoDB URI for safe logging."""
    if not uri:
        return "None"
    try:
        # Example: mongodb+srv://user:pass@cluster.mongodb.net/db
        # We want to mask 'user:pass'
        if "@" in uri:
            prefix, rest = uri.split("@", 1)
            protocol = prefix.split("://")[0] + "://"
            return f"{protocol}****:****@{rest}"
        return uri
    except Exception:
        return "Invalid URI format"

# 3️⃣ Explicit debug logging with masking
print(f"🔍 Mongo URI loaded: {get_masked_uri(MONGODB_URI)}")

# 4️⃣ Hard Validation: Refuse to start if missing or local
if not MONGODB_URI:
    print("❌ ERROR: MONGODB_URI is missing from environment/env file.")
    raise RuntimeError("Configuration Error: MONGODB_URI is required.")

if "localhost" in MONGODB_URI or "127.0.0.1" in MONGODB_URI:
    print(f"❌ ERROR: Local MongoDB detected ({get_masked_uri(MONGODB_URI)})")
    print("👉 Requirement: This application MUST use MongoDB Atlas.")
    raise RuntimeError("Refusing to start: Local MongoDB detected.")

# Check for Atlas-like string (optional but recommended)
if "mongodb.net" not in MONGODB_URI:
    logger.warning("⚠️ MONGODB_URI does not appear to be an Atlas cluster (missing 'mongodb.net')")

print("✅ MongoDB Atlas validation passed, connecting...")

try:
    # 5️⃣ Initialize Mongo
    db_client = MongoClient(MONGODB_URI)
    # Ping to verify connection
    db_client.admin.command('ping')
    db = db_client["classroom_insights"]
    
    # Log DB Identity
    db_info = db_client.nodes
    hostname = list(db_info)[0][0] if db_info else "unknown"
    
    logger.info("🚀 Connected to MongoDB Atlas")
    logger.info(f"Connected to Cluster: {hostname}")
    
    print(f"✅ Connected to MongoDB Atlas: {hostname}")

except Exception as e:
    logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
    # Crash the app if we can't connect to Atlas
    raise RuntimeError(f"Database Connection Critical Failure: {str(e)}")

# Ensure indexes for performance and deduplication
db.courses.create_index([("id", 1)], unique=True)
db.courses.create_index([("courseState", 1)])
db.teachers.create_index([("userId", 1)])
db.teachers.create_index([("courseId", 1)])
db.students.create_index([("userId", 1)])
db.students.create_index([("courseId", 1)])
db.coursework.create_index([("id", 1)], unique=True)
db.coursework.create_index([("courseId", 1)])
db.submissions.create_index([("id", 1)], unique=True)
db.submissions.create_index([("courseId", 1)])
db.submissions.create_index([("courseWorkId", 1)])

app = FastAPI(title="MIET Classroom Analytics")

# CORS Middleware
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
    "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly"
]
SERVICE_ACCOUNT_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")

def get_google_credentials(impersonated_email: str):
    """
    Creates Google credentials with Domain-Wide Delegation (impersonation).
    """
    try:
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
            raise FileNotFoundError(f"Service account file not found: {SERVICE_ACCOUNT_FILE}")
        
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, 
            scopes=SCOPES,
            subject=impersonated_email
        )
        logger.info(f"Successfully created credentials for {impersonated_email}")
        return creds
    except Exception as e:
        logger.error(f"Failed to create credentials for {impersonated_email}: {str(e)}")
        raise e

@app.get("/debug/auth-status")
async def auth_status():
    impersonated_email = os.getenv("GOOGLE_IMPERSONATED_USER")
    
    if not impersonated_email:
        return JSONResponse(
            status_code=500,
            content={
                "status": "failure",
                "message": "GOOGLE_IMPERSONATED_USER not set in .env"
            }
        )

    try:
        # Step 1: Initialize credentials
        creds = get_google_credentials(impersonated_email)
        
        # Step 2: Initialize Classroom API client (to prove it works)
        service = build('classroom', 'v1', credentials=creds)
        
        # Step 3: Perform a lightweight call (optional, but requested for 'auth failure MUST stop sync')
        # However, Milestone 1 says "Do NOT fetch data yet". 
        # But to confirm 'impersonation works', we should at least check if we can get the service object.
        
        return {
            "status": "success",
            "impersonated_email": impersonated_email,
            "scopes": SCOPES,
            "message": "Authentication and impersonation initialized successfully"
        }
    except Exception as e:
        logger.error(f"Auth Check Failed: {str(e)}")
        return JSONResponse(
            status_code=401,
            content={
                "status": "failure",
                "impersonated_email": impersonated_email,
                "error": str(e),
                "detail": "Likely Domain-Wide Delegation or Scope issue."
            }
        )

@app.get("/debug/test-courses")
async def test_courses():
    impersonated_email = os.getenv("GOOGLE_IMPERSONATED_USER")
    try:
        creds = get_google_credentials(impersonated_email)
        service = build('classroom', 'v1', credentials=creds)
        
        # Fetch courses
        results = service.courses().list(pageSize=10).execute()
        courses = results.get('courses', [])
        
        return {
            "status": "success",
            "impersonated_email": impersonated_email,
            "course_count": len(courses),
            "courses": [
                {"id": c.get("id"), "name": c.get("name")} for c in courses
            ]
        }
    except Exception as e:
        logger.error(f"Course Fetch Failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "failure",
                "impersonated_email": impersonated_email,
                "error": str(e)
            }
        )

@app.get("/debug/test-teachers/{courseId}")
async def test_teachers(courseId: str):
    impersonated_email = os.getenv("GOOGLE_IMPERSONATED_USER")
    try:
        creds = get_google_credentials(impersonated_email)
        service = build('classroom', 'v1', credentials=creds)
        
        results = service.courses().teachers().list(courseId=courseId).execute()
        teachers = results.get('teachers', [])
        
        return {
            "status": "success",
            "courseId": courseId,
            "teacher_count": len(teachers),
            "teachers": [
                {
                    "userId": t.get("userId"),
                    "name": t.get("profile", {}).get("name", {}).get("fullName"),
                    "email": t.get("profile", {}).get("emailAddress")
                } for t in teachers
            ]
        }
    except Exception as e:
        logger.error(f"Teacher Fetch Failed for {courseId}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "failure", "error": str(e)}
        )

@app.get("/debug/test-students/{courseId}")
async def test_students(courseId: str):
    impersonated_email = os.getenv("GOOGLE_IMPERSONATED_USER")
    try:
        creds = get_google_credentials(impersonated_email)
        service = build('classroom', 'v1', credentials=creds)
        
        results = service.courses().students().list(courseId=courseId).execute()
        students = results.get('students', [])
        
        return {
            "status": "success",
            "courseId": courseId,
            "student_count": len(students),
            "students": [
                {
                    "userId": s.get("userId"),
                    "name": s.get("profile", {}).get("name", {}).get("fullName"),
                    "email": s.get("profile", {}).get("emailAddress")
                } for s in students
            ]
        }
    except Exception as e:
        logger.error(f"Student Fetch Failed for {courseId}: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "failure", "error": str(e)}
        )

@app.get("/debug/db-status")
async def db_status():
    try:
        # The ismaster command is cheap and does not require auth.
        db_client.admin.command('ismaster')
        return {
            "status": "success",
            "database": db.name,
            "message": "MongoDB connection is stable"
        }
    except Exception as e:
        logger.error(f"DB Connection Failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "failure",
                "message": "MongoDB connection error",
                "error": str(e)
            }
        )

@app.post("/sync/courses")
async def sync_courses():
    impersonated_email = os.getenv("GOOGLE_IMPERSONATED_USER")
    try:
        creds = get_google_credentials(impersonated_email)
        service = build('classroom', 'v1', credentials=creds)
        
        # 1. Fetch Courses
        logger.info(f"SYNC[COURSES] Fetching courses for {impersonated_email}")
        courses_result = service.courses().list().execute()
        courses = courses_result.get('courses', [])
        logger.info(f"SYNC[COURSES] Fetched {len(courses)} courses")
        
        synced_courses = 0
        synced_teachers_count = 0
        synced_students_count = 0
        
        for course in courses:
            course_id = course.get('id')
            # Upsert Course
            course['synced_at'] = None # Placeholder for timestamp logic if needed
            db.courses.update_one(
                {'id': course_id},
                {'$set': course},
                upsert=True
            )
            synced_courses += 1
            
            # 2. Sync Teachers for this course
            try:
                teachers_result = service.courses().teachers().list(courseId=course_id).execute()
                teachers = teachers_result.get('teachers', [])
                logger.info(f"SYNC[TEACHERS] Course {course_id} → {len(teachers)} teachers")
                for t in teachers:
                    t_profile = t.get('profile', {})
                    teacher_data = {
                        'userId': t.get('userId'),
                        'courseId': course_id,
                        'name': t_profile.get('name', {}).get('fullName'),
                        'email': t_profile.get('emailAddress'),
                        'photoUrl': t_profile.get('photoUrl')
                    }
                    db.teachers.update_one(
                        {'userId': teacher_data['userId'], 'courseId': course_id},
                        {'$set': teacher_data},
                        upsert=True
                    )
                    synced_teachers_count += 1
            except Exception as te:
                logger.error(f"Sync: Failed to fetch teachers for course {course_id}: {str(te)}")

            # 3. Sync Students for this course
            try:
                students_result = service.courses().students().list(courseId=course_id).execute()
                students = students_result.get('students', [])
                logger.info(f"SYNC[STUDENTS] Course {course_id} → {len(students)} students")
                for s in students:
                    s_profile = s.get('profile', {})
                    student_data = {
                        'userId': s.get('userId'),
                        'courseId': course_id,
                        'name': s_profile.get('name', {}).get('fullName'),
                        'email': s_profile.get('emailAddress'),
                        'photoUrl': s_profile.get('photoUrl')
                    }
                    db.students.update_one(
                        {'userId': student_data['userId'], 'courseId': course_id},
                        {'$set': student_data},
                        upsert=True
                    )
                    synced_students_count += 1
            except Exception as se:
                # Sometimes students list fails if course is empty or access denied
                logger.warning(f"Sync: Failed to fetch students for course {course_id}: {str(se)}")

        logger.info(f"SYNC[COURSES] Upserted {synced_courses} courses into DB")
        logger.info(f"DB[courses] total documents after upsert: {db.courses.count_documents({})}")
        
        logger.info(f"SYNC[TEACHERS] Total teachers upserted: {synced_teachers_count}")
        logger.info(f"DB[teachers] total documents after upsert: {db.teachers.count_documents({})}")
        
        logger.info(f"SYNC[STUDENTS] Total students upserted: {synced_students_count}")
        logger.info(f"DB[students] total documents after upsert: {db.students.count_documents({})}")

        return {
            "status": "success",
            "summary": {
                "courses_synced": synced_courses,
                "teachers_synced": synced_teachers_count,
                "students_synced": synced_students_count
            }
        }
    except Exception as e:
        logger.error(f"Sync Failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "failure", "error": str(e)}
        )

@app.post("/sync/coursework")
async def sync_coursework():
    impersonated_email = os.getenv("GOOGLE_IMPERSONATED_USER")
    try:
        creds = get_google_credentials(impersonated_email)
        service = build('classroom', 'v1', credentials=creds)
        
        # We need courses to iterate
        courses = list(db.courses.find({}, {"id": 1}))
        if not courses:
            return {"status": "failure", "message": "No courses found in DB. Sync courses first."}
            
        synced_coursework = 0
        synced_submissions = 0
        
        for course in courses:
            course_id = course['id']
            try:
                # 1. Fetch Coursework
                cw_result = service.courses().courseWork().list(courseId=course_id).execute()
                coursework_list = cw_result.get('courseWork', [])
                logger.info(f"SYNC[COURSEWORK] Course {course_id} → {len(coursework_list)} assignments")
                
                for cw in coursework_list:
                    cw_id = cw['id']
                    cw['courseId'] = course_id
                    db.coursework.update_one(
                        {'id': cw_id},
                        {'$set': cw},
                        upsert=True
                    )
                    synced_coursework += 1
                    
                    # 2. Fetch Submissions for each coursework
                    try:
                        sub_result = service.courses().courseWork().studentSubmissions().list(
                            courseId=course_id,
                            courseWorkId=cw_id
                        ).execute()
                        submissions = sub_result.get('studentSubmissions', [])
                        logger.info(f"SYNC[SUBMISSIONS] Coursework {cw_id} → {len(submissions)} submissions")
                        
                        for sub in submissions:
                            sub['courseId'] = course_id
                            sub['courseWorkId'] = cw_id
                            
                            # Clean draft grades if present
                            if 'draftGrade' in sub:
                                del sub['draftGrade']
                                
                            db.submissions.update_one(
                                {'id': sub['id']},
                                {'$set': sub},
                                upsert=True
                            )
                            synced_submissions += 1
                    except Exception as se:
                        logger.warning(f"Sync: Failed submissions for cw {cw_id}: {str(se)}")
                        
            except Exception as ce:
                logger.warning(f"Sync: Failed coursework for course {course_id}: {str(ce)}")
        
        logger.info(f"DB[coursework] total documents after upsert: {db.coursework.count_documents({})}")
        logger.info(f"DB[submissions] total documents after upsert: {db.submissions.count_documents({})}")

        return {
            "status": "success",
            "summary": {
                "coursework_synced": synced_coursework,
                "submissions_synced": synced_submissions
            }
        }
    except Exception as e:
        logger.error(f"Coursework Sync Failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"status": "failure", "error": str(e)}
        )

@app.post("/api/sync/all")
async def sync_all():
    """Triggers both courses and coursework sync."""
    try:
        courses_sync = await sync_courses()
        coursework_sync = await sync_coursework()
        return {
            "status": "success",
            "courses": courses_sync,
            "coursework": coursework_sync
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "failure", "error": str(e)})

@app.get("/api/stats")
async def get_stats():
    """Fetches stats directly from DB with unique person counts for students and teachers."""
    # Get IDs of active courses
    active_courses = list(db.courses.find({"courseState": "ACTIVE"}, {"id": 1}))
    active_ids = [c["id"] for c in active_courses]
    
    # Use aggregation for robust unique counts
    unique_students_count = len(db.students.distinct("userId", {"courseId": {"$in": active_ids}}))
    unique_teachers_count = len(db.teachers.distinct("userId", {"courseId": {"$in": active_ids}}))
    
    stats = {
        "courses": len(active_ids),
        "students": unique_students_count,
        "teachers": unique_teachers_count,
        "assignments": db.coursework.count_documents({"courseId": {"$in": active_ids}}),
        "submissions": db.submissions.count_documents({"courseId": {"$in": active_ids}})
    }
    
    logger.info(f"STATS served: UniqueStudents={unique_students_count}, UniqueTeachers={unique_teachers_count}")
    return stats

@app.get("/debug/db-source")
async def get_db_source():
    """Detailed debug endpoint to verify data source and counts."""
    active_courses = db.courses.count_documents({"courseState": "ACTIVE"})
    total_courses = db.courses.count_documents({})
    
    return {
        "mongo_uri": get_masked_uri(MONGODB_URI),
        "database": db.name,
        "course_summary": {
            "active": active_courses,
            "archived": total_courses - active_courses,
            "total": total_courses
        },
        "collections": {
            "courses": db.courses.count_documents({}),
            "teachers": db.teachers.count_documents({}),
            "students": db.students.count_documents({}),
            "coursework": db.coursework.count_documents({}),
            "submissions": db.submissions.count_documents({})
        }
    }

@app.get("/api/courses")
async def get_courses(page: int = 1, limit: int = 10, search: str = ""):
    skip = (page - 1) * limit
    query = {"courseState": "ACTIVE"}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
        
    courses = list(db.courses.find(query).skip(skip).limit(limit))
    total = db.courses.count_documents(query)
    
    # Enrich each course with counts from related collections
    for c in courses:
        if "_id" in c: c["_id"] = str(c["_id"])
        course_id = c["id"]
        
        # Count unique teachers for this course
        c["teacherCount"] = len(db.teachers.distinct("userId", {"courseId": course_id}))
        
        # Count unique students for this course
        c["studentCount"] = len(db.students.distinct("userId", {"courseId": course_id}))
        
        # Count assignments for this course
        c["assignmentCount"] = db.coursework.count_documents({"courseId": course_id})
    
    return {"data": courses, "total": total, "page": page, "limit": limit}

@app.get("/api/courses/{courseId}")
async def get_course_detail(courseId: str):
    course = db.courses.find_one({"id": courseId, "courseState": "ACTIVE"})
    if not course: 
        raise HTTPException(status_code=404, detail="Course not found or is archived")
    
    if "_id" in course: course["_id"] = str(course["_id"])
    
    teachers = list(db.teachers.find({"courseId": courseId}))
    students = list(db.students.find({"courseId": courseId}))
    assignments = list(db.coursework.find({"courseId": courseId}))
    
    for items in [teachers, students, assignments]:
        for item in items:
            if "_id" in item: item["_id"] = str(item["_id"])
            
    return {
        "course": course,
        "teachers": teachers,
        "students": students,
        "assignments": assignments
    }

@app.get("/api/students")
async def get_students(page: int = 1, limit: int = 10, search: str = ""):
    """Returns a deduplicated list of students with course counts."""
    active_ids = [c["id"] for c in db.courses.find({"courseState": "ACTIVE"}, {"id": 1})]
    skip = (page - 1) * limit
    
    match_query = {"courseId": {"$in": active_ids}}
    if search:
        match_query["name"] = {"$regex": search, "$options": "i"}
        
    pipeline = [
        {"$match": match_query},
        {"$group": {
            "_id": "$userId",
            "name": {"$first": "$name"},
            "email": {"$first": "$email"},
            "userId": {"$first": "$userId"},
            "photoUrl": {"$first": "$photoUrl"},
            "courseCount": {"$sum": 1}
        }},
        {"$sort": {"name": 1}},
        {"$facet": {
            "metadata": [{"$count": "total"}],
            "data": [{"$skip": skip}, {"$limit": limit}]
        }}
    ]
    
    result = list(db.students.aggregate(pipeline))[0]
    total = result["metadata"][0]["total"] if result["metadata"] else 0
    students = result["data"]
    
    for s in students:
        if "_id" in s: s["_id"] = str(s["_id"])
    return {"data": students, "total": total, "page": page, "limit": limit}

@app.get("/api/teachers")
async def get_teachers(page: int = 1, limit: int = 10, search: str = ""):
    """Returns a deduplicated list of teachers with course counts."""
    active_ids = [c["id"] for c in db.courses.find({"courseState": "ACTIVE"}, {"id": 1})]
    skip = (page - 1) * limit
    
    match_query = {"courseId": {"$in": active_ids}}
    if search:
        match_query["name"] = {"$regex": search, "$options": "i"}
        
    pipeline = [
        {"$match": match_query},
        {"$group": {
            "_id": "$userId",
            "name": {"$first": "$name"},
            "email": {"$first": "$email"},
            "userId": {"$first": "$userId"},
            "photoUrl": {"$first": "$photoUrl"},
            "courseCount": {"$sum": 1}
        }},
        {"$sort": {"name": 1}},
        {"$facet": {
            "metadata": [{"$count": "total"}],
            "data": [{"$skip": skip}, {"$limit": limit}]
        }}
    ]
    
    result = list(db.teachers.aggregate(pipeline))[0]
    total = result["metadata"][0]["total"] if result["metadata"] else 0
    teachers = result["data"]
    
    for t in teachers:
        if "_id" in t: t["_id"] = str(t["_id"])
    return {"data": teachers, "total": total, "page": page, "limit": limit}

@app.get("/api/assignments")
async def get_assignments(page: int = 1, limit: int = 10, search: str = ""):
    """Returns assignments with course names via MongoDB aggregation."""
    active_ids = [c["id"] for c in db.courses.find({"courseState": "ACTIVE"}, {"id": 1})]
    skip = (page - 1) * limit
    
    match_query = {"courseId": {"$in": active_ids}}
    if search:
        match_query["title"] = {"$regex": search, "$options": "i"}
    
    pipeline = [
        {"$match": match_query},
        {"$lookup": {
            "from": "courses",
            "localField": "courseId",
            "foreignField": "id",
            "as": "course"
        }},
        {"$addFields": {
            "courseName": {"$arrayElemAt": ["$course.name", 0]}
        }},
        {"$project": {
            "course": 0  # Remove the joined array, keep only courseName
        }},
        {"$facet": {
            "metadata": [{"$count": "total"}],
            "data": [{"$skip": skip}, {"$limit": limit}]
        }}
    ]
    
    result = list(db.coursework.aggregate(pipeline))[0]
    total = result["metadata"][0]["total"] if result["metadata"] else 0
    assignments = result["data"]
    
    for a in assignments:
        if "_id" in a: a["_id"] = str(a["_id"])
        # Fallback if course not found
        if not a.get("courseName"):
            a["courseName"] = "Unknown Course"
    
    return {"data": assignments, "total": total, "page": page, "limit": limit}

@app.get("/api/assignments/{id}")
async def get_assignment_detail(id: str, page: int = 1, limit: int = 10):
    """Returns assignment details with course name and submissions with student names."""
    assignment = db.coursework.find_one({"id": id})
    if not assignment: 
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    # Check if parent course is active
    parent_course = db.courses.find_one({"id": assignment["courseId"], "courseState": "ACTIVE"})
    if not parent_course:
        raise HTTPException(status_code=404, detail="Assignment belongs to an archived course")

    if "_id" in assignment: assignment["_id"] = str(assignment["_id"])
    
    # Add course name to assignment
    assignment["courseName"] = parent_course.get("name", "Unknown Course")
    
    # Fetch submissions with student names using aggregation
    skip = (page - 1) * limit
    
    submissions_pipeline = [
        {"$match": {"courseWorkId": id}},
        {"$lookup": {
            "from": "students",
            "localField": "userId",
            "foreignField": "userId",
            "as": "student"
        }},
        {"$addFields": {
            "studentName": {
                "$ifNull": [
                    {"$arrayElemAt": ["$student.name", 0]},
                    "Unknown Student"
                ]
            }
        }},
        {"$project": {
            "student": 0  # Remove the joined array
        }},
        {"$facet": {
            "metadata": [{"$count": "total"}],
            "data": [{"$skip": skip}, {"$limit": limit}]
        }}
    ]
    
    submissions_result = list(db.submissions.aggregate(submissions_pipeline))[0]
    total = submissions_result["metadata"][0]["total"] if submissions_result["metadata"] else 0
    submissions = submissions_result["data"]
    
    for s in submissions:
        if "_id" in s: s["_id"] = str(s["_id"])
        
    return {
        "assignment": assignment,
        "submissions": {"data": submissions, "total": total, "page": page, "limit": limit}
    }

# --- Analytics Endpoints ---

async def calculate_student_analytics():
    """Shared logic for compute student analytics across the institution."""
    # 1. Active Courses
    active_courses = list(db.courses.find({"courseState": "ACTIVE"}, {"id": 1}))
    active_ids = [c["id"] for c in active_courses]
    if not active_ids:
        return []

    # 2. Coursework map to avoid multiple queries
    # Pull only necessary fields: id, courseId, creationTime
    all_cw = list(db.coursework.find(
        {"courseId": {"$in": active_ids}}, 
        {"id": 1, "courseId": 1, "creationTime": 1}
    ).sort("creationTime", 1))
    
    course_cw_map = {}
    for cw in all_cw:
        cid = cw['courseId']
        if cid not in course_cw_map:
            course_cw_map[cid] = []
        course_cw_map[cid].append(cw)

    # 3. Unique Students and their enrolled courses
    students_pipeline = [
        {"$match": {"courseId": {"$in": active_ids}}},
        {"$group": {
            "_id": "$userId",
            "userId": {"$first": "$userId"},
            "studentName": {"$first": "$name"},
            "courseIds": {"$push": "$courseId"}
        }}
    ]
    unique_students = list(db.students.aggregate(students_pipeline))

    # 4. Submissions for these students
    # Group submissions by userId
    sub_pipeline = [
        {"$match": {"courseId": {"$in": active_ids}}},
        {"$group": {
            "_id": "$userId",
            "subs": {"$push": {
                "courseWorkId": "$courseWorkId",
                "state": "$state",
                "lastUpdated": "$updateTime"
            }}
        }}
    ]
    user_subs = {s["_id"]: s["subs"] for s in db.submissions.aggregate(sub_pipeline)}

    results = []
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    for s in unique_students:
        uid = s["userId"]
        s_courses = s["courseIds"]
        s_subs_list = user_subs.get(uid, [])
        sub_map = {sub["courseWorkId"]: sub for sub in s_subs_list}

        # Build list of assignments for this student across all their courses
        student_assignments = []
        for cid in s_courses:
            student_assignments.extend(course_cw_map.get(cid, []))
        
        # Sort by creation time to check consecutive missing institution-wide
        student_assignments.sort(key=lambda x: x.get("creationTime", ""))
        
        total = len(student_assignments)
        if total == 0: continue

        submitted = 0
        missing = 0
        consecutive_missing = 0
        max_consecutive = 0
        last_activity_date = None

        for cw in student_assignments:
            sub = sub_map.get(cw["id"])
            # MISSING defined as state NOT turned in or returned
            is_submitted = sub and sub.get("state") in ["TURNED_IN", "RETURNED"]
            
            if is_submitted:
                submitted += 1
                consecutive_missing = 0
                
                # Update last activity date if this submission is newer
                ut = sub.get("lastUpdated")
                if ut:
                    try:
                        # Parse ISO string (handle Z)
                        dt = datetime.fromisoformat(ut.replace('Z', '+00:00')).replace(tzinfo=None)
                        if last_activity_date is None or dt > last_activity_date:
                            last_activity_date = dt
                    except:
                        pass
            else:
                missing += 1
                consecutive_missing += 1
                if consecutive_missing > max_consecutive:
                    max_consecutive = consecutive_missing

        missed_pct = (missing / total * 100) if total > 0 else 0
        
        # SILENT Logic: Zero submissions OR no activity in last 30 days
        is_silent = False
        if submitted == 0:
            is_silent = True
        elif last_activity_date and last_activity_date < thirty_days_ago:
            is_silent = True
            
        # AT-RISK Logic: Missed >= 40% OR 2+ consecutive missing OR Submission rate < 60%
        is_at_risk = False
        if total > 0:
            if missed_pct >= 40 or max_consecutive >= 2 or (submitted / total < 0.6):
                is_at_risk = True

        results.append({
            "userId": uid,
            "studentName": s["studentName"],
            "lastActivity": last_activity_date.strftime("%Y-%m-%d") if last_activity_date else "None",
            "totalAssignments": total,
            "submitted": submitted,
            "missed": missing,
            "missedPercentage": int(missed_pct),
            "isSilent": is_silent,
            "isAtRisk": is_at_risk
        })
    
    return results

@app.get("/analytics/silent-students")
async def get_silent_students(page: int = 1, limit: int = 10, search: str = ""):
    all_data = await calculate_student_analytics()
    # Filter for silent
    silent = [s for s in all_data if s["isSilent"]]
    
    # Filter by name if search provided
    if search:
        silent = [s for s in silent if search.lower() in s["studentName"].lower()]
    
    total_count = len(silent)
    
    # Sort and Paginate
    silent.sort(key=lambda x: x["studentName"])
    skip = (page - 1) * limit
    paginated = silent[skip : skip + limit]
        
    return {
        "count": total_count,
        "students": paginated,
        "page": page,
        "limit": limit
    }

@app.get("/analytics/at-risk-students")
async def get_at_risk_students(page: int = 1, limit: int = 10, search: str = ""):
    all_data = await calculate_student_analytics()
    # Filter for at-risk
    at_risk = [s for s in all_data if s["isAtRisk"]]
    
    # Filter by name if search provided
    if search:
        at_risk = [s for s in at_risk if search.lower() in s["studentName"].lower()]
    
    total_count = len(at_risk)
    
    # Sort and Paginate
    at_risk.sort(key=lambda x: x["studentName"])
    skip = (page - 1) * limit
    paginated = at_risk[skip : skip + limit]
        
    return {
        "count": total_count,
        "students": paginated,
        "page": page,
        "limit": limit
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
