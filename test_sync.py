import requests
try:
    response = requests.post("http://localhost:8000/sync/courses")
    print(f"Sync Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
