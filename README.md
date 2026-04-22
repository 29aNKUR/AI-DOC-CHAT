# AI Doc Chat 🤖

An AI-powered document chat application. Upload any PDF and ask questions about it using natural language — powered by RAG (Retrieval Augmented Generation).

🔗 **Live Demo:** [ai-doc-chat-eta.vercel.app](https://ai-doc-chat-eta.vercel.app)

---

## Features

- 📄 Upload any PDF document
- 🔍 Ask questions in natural language
- 🤖 Get AI-powered answers using RAG
- ⚡ Fast responses powered by Groq (Llama 3.3 70B)
- 🧠 Smart document chunking with LangChain
- 🗄️ Vector similarity search with ChromaDB

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- LangChain
- ChromaDB (Vector Database)
- HuggingFace Embeddings (FastEmbed)
- Groq API (Llama 3.3 70B)

### Deployment
- Frontend: Vercel
- Backend: Railway

---

## How It Works

```
PDF Upload
    ↓
LangChain loads and reads the PDF
    ↓
Text is split into chunks (RecursiveCharacterTextSplitter)
    ↓
Chunks are converted to vector embeddings (FastEmbed)
    ↓
Vectors stored in ChromaDB
    ↓
User asks a question
    ↓
Question converted to vector → similarity search finds relevant chunks
    ↓
Relevant chunks + question sent to Groq LLM
    ↓
Answer returned to user
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- Groq API key (free at console.groq.com)

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:
```
GROQ_API_KEY=your-groq-api-key
```

Run the backend:
```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` folder:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/upload` | Upload a PDF file |
| POST | `/ask` | Ask a question about the uploaded PDF |

---

## Known Limitations

- Uploaded files are stored in ephemeral storage. A production version would use AWS S3 for file storage and Pinecone or pgvector for persistent vector storage.
- Currently supports one PDF at a time. Multi-document support would be a future enhancement.

---

## Author

**Ankur Semle** — Full Stack Engineer

- GitHub: [@29aNKUR](https://github.com/29aNKUR)
- LinkedIn: [Ankur Semle](https://linkedin.com/in/ankursemle)