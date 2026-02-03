"""
Quick verification script to test the refactored endpoints.
Run this after restarting the backend server.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_teachers():
    print("\n" + "="*60)
    print("Testing /api/teachers endpoint")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/teachers?page=1&limit=5")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Found {data['total']} teachers")
        print("\nSample teachers:")
        for teacher in data['data'][:3]:
            print(f"  - {teacher.get('name', 'Unknown')}: {teacher.get('courseCount', 0)} courses")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

def test_assignments():
    print("\n" + "="*60)
    print("Testing /api/assignments endpoint")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/assignments?page=1&limit=5")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Found {data['total']} assignments")
        print("\nSample assignments:")
        for assignment in data['data'][:3]:
            print(f"  - {assignment.get('title', 'Untitled')}")
            print(f"    Course: {assignment.get('courseName', 'Unknown Course')}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

def test_assignment_detail():
    print("\n" + "="*60)
    print("Testing /api/assignments/{id} endpoint")
    print("="*60)
    
    # First get an assignment ID
    response = requests.get(f"{BASE_URL}/assignments?page=1&limit=1")
    if response.status_code != 200:
        print("❌ Could not fetch assignment list")
        return
    
    data = response.json()
    if not data['data']:
        print("⚠️  No assignments found in database")
        return
    
    assignment_id = data['data'][0]['id']
    print(f"Testing with assignment ID: {assignment_id}")
    
    response = requests.get(f"{BASE_URL}/assignments/{assignment_id}?page=1&limit=5")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success!")
        print(f"\nAssignment: {data['assignment'].get('title', 'Untitled')}")
        print(f"Course: {data['assignment'].get('courseName', 'Unknown Course')}")
        print(f"\nSubmissions: {data['submissions']['total']} total")
        print("\nSample submissions:")
        for sub in data['submissions']['data'][:3]:
            print(f"  - Student: {sub.get('studentName', 'Unknown Student')}")
            print(f"    Status: {sub.get('state', 'Unknown')}")
            print(f"    Grade: {sub.get('assignedGrade', '---')}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("\n🧪 TESTING REFACTORED ENDPOINTS")
    print("="*60)
    print("Make sure the backend server is running on port 8000")
    print("="*60)
    
    try:
        test_teachers()
        test_assignments()
        test_assignment_detail()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend server")
        print("Please make sure the server is running:")
        print("  cd c:\\Users\\summa\\Downloads\\ClassPy")
        print("  python main.py")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
