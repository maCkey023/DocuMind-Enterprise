import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our new modular routers
from api.chat_routes import router as chat_router
from api.doc_routes import router as doc_router

app = FastAPI(title="DocuMind Enterprise API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the routers (All routes will now be prefixed with /api)
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(doc_router, prefix="/api", tags=["Documents"])

if __name__ == "__main__":
    print("🚀 Starting DocuMind Enterprise Server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
