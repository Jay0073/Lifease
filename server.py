import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    prompt: str

@app.post("/generate")
def generate_response(query: Query):
    response = requests.post(
        "http://localhost:11434/api/generate",  # ✅ API URL
        json={"model": "deepseek-r1:1.5b", "prompt": query.prompt},
        stream=True  # ✅ Enable streaming
    )
    
    print("Response Text:", response.text)  # ✅ Debug Response

    try:
        return response.json()  # ✅ Convert response to JSON
    except requests.exceptions.JSONDecodeError:
        return {"error": "Invalid JSON response", "raw_response": response.text}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)