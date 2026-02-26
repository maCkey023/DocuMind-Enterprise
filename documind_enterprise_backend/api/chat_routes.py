import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage

from schemas.requests import ChatRequest
from services.chat_engine import build_chat_chain
from services.memory import chat_sessions

router = APIRouter()
chat_chain = build_chat_chain()

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    async def stream_generator():
        full_answer = ""
        citations = []
        
        # Grab the specific memory for THIS chat session
        current_history = chat_sessions.get(request.session_id, [])

        try:
            async for chunk in chat_chain.astream({
                "input": request.message,
                "chat_history": current_history 
            }):
                if "context" in chunk:
                    for doc in chunk["context"]:
                        raw_page = doc.metadata.get("page", "Unknown")
                        page = int(raw_page) if isinstance(raw_page, float) else raw_page
                        source_file = doc.metadata.get("source", "Unknown").split("/")[-1].split("\\")[-1]
                        citations.append(f"Page {page} - {source_file}")

                if "answer" in chunk:
                    token = chunk["answer"]
                    full_answer += token
                    yield f"data: {json.dumps({'token': token})}\n\n"

            unique_citations = list(set(citations))
            yield f"data: {json.dumps({'citations': unique_citations})}\n\n"

            # Save the updated conversation back to this specific session ID
            current_history.extend([
                HumanMessage(content=request.message),
                AIMessage(content=full_answer)
            ])
            chat_sessions[request.session_id] = current_history

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

@router.get("/new-chat")
async def new_chat():
    # To clear memory properly in a session-based app, the frontend just generates a new ID.
    # But if you want a master clear route:
    chat_sessions.clear()
    return {"status": "success", "message": "All short-term memory cleared."}