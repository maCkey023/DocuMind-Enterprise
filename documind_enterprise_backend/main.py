import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import slowapi exception handlers
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

# Import our new modular routers AND the limiter
from api.chat_routes import router as chat_router, limiter
from api.doc_routes import router as doc_router

app = FastAPI(title="DocuMind Enterprise API")

# --- RATE LIMITER SETUP ---
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# --------------------------

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