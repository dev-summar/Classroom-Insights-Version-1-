import requests
try:
    response = requests.get("http://localhost:8000/debug/auth-status")
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
