# 🌌 DocuMind Enterprise: Context-Aware RAG Protocol

**DocuMind Enterprise** is a production-ready, RAG-based assistant designed to ingest corporate documents and provide strict, context-aware responses with real-time streaming and citation tracking.

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Pinecone](https://img.shields.io/badge/Pinecone-VectorDB-232d3e?style=for-the-badge)

---

## 🖼️ Project Showcase

### 01. Intuitive Landing Experience
The "Midnight Aurora" theme provides a clean, focused environment for enterprise document analysis.
![Landing Page](./assets/01-landing-page.png)

### 02. Seamless Data Ingestion
Successfully process and vectorize complex enterprise documents into the Pinecone database with real-time feedback.
![Data Ingestion](./assets/02-data-ingestion.png)

### 03. Precision RAG with Paged Citations
Get accurate answers with clickable citations that point directly to the source page, ensuring data transparency.
![Citations](./assets/04-paged-citations.png)

### 04. Advanced Database Control & Privacy
Manage your vector index with security-first features like "Brain Wipe" and full database purging.
![Database Management](./assets/05-database-management.png)

---

## 📂 Project Architecture

### Backend (FastAPI)
A modular architecture built for scalability and separation of concerns.
- **`documind_enterprise_backend/main.py`**: Entry point and route registration.
- **`api/`**: Contains `chat_routes.py` for streaming and `doc_routes.py` for indexing.
- **`services/`**: Houses `chat_engine.py` (RAG logic) and `ingest_engine.py` (PDF parsing).
- **`schemas/`**: Pydantic models for strict API request validation.

### Frontend (React + Vite)
A minimalist, Gemini-inspired UI with a dark "Midnight Aurora" theme.
- **`documind_enterprise_frontend/src/App.jsx`**: Manages global state and sidebar toggles.
- **`components/Sidebar.jsx`**: Handles document uploads and session history.
- **`components/ChatWindow.jsx`**: Features real-time streaming and Markdown rendering.

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