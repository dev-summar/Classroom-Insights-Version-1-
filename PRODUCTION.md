# Production Deployment Guide - Miet Classroom Insights

This document outlines the steps required to deploy the Miet Classroom Insights application in a production environment manually.

## 1. System Prerequisites

Ensure the production server meets the following requirements:

- **Operating System**: Linux (Ubuntu 20.04/22.04 LTS recommended) or Windows Server.
- **Runtime Environments**:
  - **Python**: Version 3.9 or higher.
  - **Node.js**: Version 18 or higher (required for building the frontend).
- **Database**: MongoDB (Atlas Cluster or self-hosted instance).
- **External Services**: Google Cloud Platform Project (enabled for Google Auth and APIs).

## 2. Environment Configuration

Create a `.env` file in the project root directory. **Do not commit this file to version control.**

```ini
# --- Database Configuration ---
# Connection string for MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=miet_classroom_insights

# --- Google Cloud Configuration ---
# Path to the service account JSON file (if using server-to-server auth)
GOOGLE_APPLICATION_CREDENTIALS=certs/service-account.json
# OAuth 2.0 Client ID and Secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# --- Application Security ---
# Secret key for signing session cookies or JWTs
SECRET_KEY=change-this-to-a-secure-random-string
# Allowed Frontend Origin (CORS)
FRONTEND_URL=https://your-production-domain.com
```

## 3. Backend Setup (FastAPI)

The backend uses FastAPI and Uvicorn.

1.  **Navigate to the project root**.

2.  **Create a Virtual Environment**:
    ```bash
    python -m venv venv
    # Activate:
    source venv/bin/activate      # Linux/MacOS
    # .\venv\Scripts\activate     # Windows
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run in Production Mode**:
    Use `uvicorn` with multiple workers to handle concurrent requests efficiently.
    ```bash
    # Replace 'main:app' with your actual entry point (e.g., 'app.main:app')
    uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers
    ```

    *Note: For robust process management on Linux, consider using `systemd` or `supervisor` to keep the application running in the background.*

## 4. Frontend Setup (React + Vite)

The frontend is a React application located in the `frontend/` directory.

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build for Production**:
    This compiles the React app into static files (HTML, CSS, JS) optimized for performance.
    ```bash
    npm run build
    ```
    *Output will typically be in `frontend/dist`.*

## 5. Serving the Application (Nginx Example)

It is recommended to use a reverse proxy like **Nginx** to serve the static frontend files and proxy API requests to the backend.

**Example Nginx Configuration Snippet:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve Frontend Static Files
    location / {
        root /path/to/Miet-Classroom-Insights/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to FastAPI
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```