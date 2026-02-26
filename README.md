# 🌌 DocuMind Enterprise: Context-Aware RAG Protocol

**DocuMind Enterprise** is a production-ready, RAG-based assistant designed to ingest corporate documents and provide strict, context-aware responses with real-time streaming and citation tracking.

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Pinecone](https://img.shields.io/badge/Pinecone-VectorDB-232d3e?style=for-the-badge)

---

## 📂 Project Architecture



### Backend (FastAPI)
A modular architecture built for scalability and separation of concerns.
- **`main.py`**: Entry point, CORS configuration, and route registration.
- **`api/`**: Contains `chat_routes.py` for streaming and `doc_routes.py` for indexing.
- **`services/`**: Houses `chat_engine.py` (RAG logic), `ingest_engine.py` (PDF parsing), and `memory.py` (Session storage).
- **`schemas/`**: Pydantic models for strict API request validation.

### Frontend (React + Vite)
A minimalist, Gemini-inspired UI with a collapsible sidebar and dark "Midnight Aurora" theme.
- **`App.jsx`**: Manages global state including sessions, themes, and sidebar toggles.
- **`Sidebar.jsx`**: Handles document uploads and session history.
- **`ChatWindow.jsx`**: Features real-time streaming, Markdown rendering, and auto-scroll.

---

## 🚀 Key Features
- **Unstructured Parsing**: Mandated `UnstructuredPDFLoader` for high-accuracy document layout analysis.
- **Real-time Streaming**: Instant token delivery via Server-Sent Events (SSE).
- **Session Intelligence**: Independent chat histories maintained via a session-based memory dictionary.
- **Strict Guardrails**: Zero-inference answering—AI only responds using provided document context.

---

## ⚙️ Setup Instructions

### Backend Setup
1. `cd documind_enterprise_backend`
2. `pip install -r requirements.txt`
3. Configure `.env` with `GROQ_API_KEY` and `PINECONE_API_KEY`.
4. `python main.py`

### Frontend Setup
1. `cd documind_enterprise_frontend`
2. `npm install`
3. `npm run dev`

---
**Developed by [maCkey023](https://github.com/maCkey023)**.