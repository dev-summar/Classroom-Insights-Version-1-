import requests
courseId = "842382028238"
try:
    response = requests.get(f"http://localhost:8000/debug/test-teachers/{courseId}")
    print(f"Teachers Response Body: {response.json()}")
    
    response = requests.get(f"http://localhost:8000/debug/test-students/{courseId}")
    print(f"Students Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
