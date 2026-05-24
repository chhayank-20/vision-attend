import requests
import sys

BASE_URL = "http://localhost:8000/api"

def main():
    print("Logging in...")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} {response.text}")
        sys.exit(1)

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful!")

    print("Testing recognition endpoint...")
    
    files = {'file': open('/app/data/test_frame.jpg', 'rb')}
    res = requests.post(
        f"{BASE_URL}/cameras/test-recognition",
        headers=headers,
        files=files
    )

    if res.status_code == 200:
        print("Response:", res.json())
    else:
        print("Failed:", res.status_code, res.text)

if __name__ == "__main__":
    main()
