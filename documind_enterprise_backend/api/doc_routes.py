import os
import shutil
from fastapi import APIRouter, UploadFile, File
from pinecone import Pinecone

from services.ingest_engine import ingest_document
from services.memory import chat_sessions

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        os.makedirs("./data", exist_ok=True)
        file_path = f"./data/{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        ingest_document(file_path=file_path)
        
        return {"status": "success", "filename": file.filename}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.get("/clear-index")
async def clear_pinecone_index():
    try:
        pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        index = pc.Index(os.environ.get("PINECONE_INDEX_NAME"))
        
        index.delete(delete_all=True, namespace="corporate-policies-v1")
        chat_sessions.clear() # Wipe memory too
        
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}