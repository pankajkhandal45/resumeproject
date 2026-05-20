import requests

def test_ml():
    url = "http://127.0.0.1:8000/analyze-resume"
    data = {
        "text": "Experienced Python developer with skills in React, Node.js and AWS. 5 years of experience."
    }
    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ml()
