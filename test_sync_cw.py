import requests
try:
    response = requests.post("http://localhost:8000/sync/coursework")
    print(f"Sync Coursework Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
