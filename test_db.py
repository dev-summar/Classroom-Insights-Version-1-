import requests
try:
    response = requests.get("http://localhost:8000/debug/db-status")
    print(f"DB Status Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
