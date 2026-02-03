# ClassPy - Classroom Analytics Platform

ClassPy is a comprehensive analytics platform for Google Classroom, designed to provide insights into student engagement, assignment completion, and course activity. It consists of a FastAPI backend that syncs data from Google Classroom to a MongoDB database, and a React frontend for visualizing the data.

## 🚀 Features

-   **Data Synchronization**: Sync Courses, Teachers, Students, Coursework, and Submissions from Google Classroom.
-   **Analytics**: Identify "Silent Students" (inactive) and "At-Risk Students" (missing assignments).
-   **Dashboards**: View stats for Courses, Teachers, and Students.
-   **Search & Filter**: filtering capabilities across all data tables.

---

## 🛠️ Technology Stack

### Backend
-   **Language**: Python 3.8+
-   **Framework**: FastAPI
-   **Database**: MongoDB (Atlas recommended)
-   **Authentication**: Google Service Account (Domain-Wide Delegation)

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: CSS / Tailwind (if applicable) -> *Note: Project appears to use standard CSS/Lucide icons*
-   **HTTP Client**: Axios

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
-   **Python 3.x**: [Download Python](https://www.python.org/downloads/)
-   **Node.js & npm**: [Download Node.js](https://nodejs.org/)
-   **MongoDB Atlas Cluster**: Create a free cluster at [HTML](https://www.mongodb.com/atlas/database).
-   **Google Cloud Service Account**:
    -   Enable "Google Classroom API".
    -   Create a Service Account and download the JSON key file.
    -   Enable Domain-Wide Delegation for the Service Account.
    -   **Scopes Required**:
        -   `https://www.googleapis.com/auth/classroom.courses.readonly`
        -   `https://www.googleapis.com/auth/classroom.rosters.readonly`
        -   `https://www.googleapis.com/auth/classroom.coursework.students.readonly`
        -   `https://www.googleapis.com/auth/classroom.student-submissions.students.readonly`

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ClassPy
```

### 2. Backend Setup
Navigate to the root directory `ClassPy/`.

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: It is recommended to use a virtual environment (`python -m venv venv`).*

2.  **Service Account Key**:
    -   Place your Google Service Account JSON file in the root directory.
    -   Name it `service-account.json` (or update `.env` accordingly).

3.  **Environment Variables**:
    -   The project expects a `.env` file in the root directory.
    -   **Required Variables**:
        ```env
        PORT=8000
        GOOGLE_APPLICATION_CREDENTIALS=service-account.json
        GOOGLE_IMPERSONATED_USER=your-admin-email@school.edu
        MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=Cluster1
        FRONTEND_ORIGIN=http://localhost:5173
        ```

### 3. Frontend Setup
Navigate to the frontend directory `ClassPy/frontend/`.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    -   Create a `.env` file in `ClassPy/frontend/`.
    -   **Required Variables**:
        ```env
        VITE_API_BASE_URL=http://localhost:8000/api
        ```

---

## 🏃‍♂️ Running the Application

### Start the Backend
From the root directory (`ClassPy/`):

```bash
python main.py
```
*The server will start at `http://localhost:8000`.*

### Start the Frontend
From the frontend directory (`ClassPy/frontend/`):

```bash
npm run dev
```
*The app will be accessible at `http://localhost:5173`.*

---

## 🔌 API Endpoints

### Synchronization
-   `POST /api/sync/all`: Trigger full sync (Courses + Coursework).
-   `POST /api/sync/courses`: Sync only courses, teachers, and students.
-   `POST /api/sync/coursework`: Sync assignments and submissions.

### Data Retrieval
-   `GET /api/stats`: Dashboard statistics.
-   `GET /api/courses`: List active courses (paginated, searchable).
-   `GET /api/courses/{id}`: Detailed view of a course.
-   `GET /api/students`: List unique students.
-   `GET /api/teachers`: List unique teachers.
-   `GET /api/assignments`: List all assignments.
-   `GET /api/assignments/{id}`: Assignment details + submissions.

### Analytics
-   `GET /analytics/silent-students`: List students with no activity/submissions.
-   `GET /analytics/at-risk-students`: List students with high missing assignment rates.

### Debug / Status
-   `GET /debug/db-source`: View database connection status and collection counts.
-   `GET /debug/auth-status`: Verify Google Auth configuration.

---

## 🔒 Security Note
-   Never commit `service-account.json` or `.env` files to version control.
-   Ensure `MONGODB_URI` credentials are kept secret.
-   The backend validates that it is NOT running against a local MongoDB instance for production safety.
