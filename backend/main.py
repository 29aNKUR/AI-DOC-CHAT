from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import os
import re
import shutil
from dotenv import load_dotenv
import chromadb

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

embeddings = FastEmbedEmbeddings()

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.3-70b-versatile"
)

vector_store = None

prompt_template = PromptTemplate.from_template("""
You are a helpful assistant that answers questions based on the provided document context.

Context from document:
{context}

Question: {question}

Answer based only on the context above. If the answer is not in the context, say "I couldn't find that information in the document."

Answer:""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vector_store

    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    loader = PyPDFLoader(file_path)
    documents = loader.load()

    for doc in documents:
        text = doc.page_content
        text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
        text = re.sub(r' +', ' ', text)
        text = re.sub(r'\n{2,}', '\n', text)
        doc.page_content = text.strip()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(documents)

    if os.path.exists("chroma_db"):
        shutil.rmtree("chroma_db")

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        client=chromadb.EphemeralClient()
    )

    return {
        "message": "PDF uploaded and processed successfully",
        "pages": len(documents),
        "chunks": len(chunks)
    }

@app.post("/ask")
async def ask_question(data: dict):
    global vector_store

    if vector_store is None:
        if os.path.exists("chroma_db"):
            vector_store = Chroma(
                client=chromadb.EphemeralClient(),
                embedding_function=embeddings
)
        else:
            return {"answer": "Please upload a PDF first"}

    question = data.get("question")

    retriever = vector_store.as_retriever(search_kwargs={"k": 3})

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt_template
        | llm
        | StrOutputParser()
    )

    answer = rag_chain.invoke(question)
    return {"answer": answer}

@app.get("/")
def root():
    return {"message": "AI Doc Chat API is running with RAG"}
