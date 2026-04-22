from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import pypdf
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

pdf_text_store = {}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    
    os.makedirs("uploads", exist_ok=True)
    
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(contents)
    
    reader = pypdf.PdfReader(f"uploads/{file.filename}")
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    
    pdf_text_store["current"] = text
    return {"message": "PDF uploaded successfully", "pages": len(reader.pages)}

@app.post("/ask")
async def ask_question(data: dict):
    question = data.get("question")
    context = pdf_text_store.get("current", "")
    
    if not context:
        return {"answer": "Please upload a PDF first"}
    
    try:
        response = client.chat.completions.create(
       model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a helpful assistant. Answer questions based on this document:\n\n{context[:4000]}"
                },
                {
                    "role": "user",
                    "content": question
                }
            ]
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        print("Error:", str(e))
        return {"answer": f"Error: {str(e)}"}

@app.get("/")
def root():
    return {"message": "AI Doc Chat API is running"}