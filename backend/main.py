from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from datetime import datetime
from io import BytesIO
from typing import Optional
from cartesia import Cartesia
from rag_pipeline import get_rag_pipeline
from config import get_settings

settings = get_settings()

# Initialize app
app = FastAPI(
    title="JARVIS Personal Assistant",
    version="1.0",
    description="A chatbot that answers questions specifically about Ankit using LangChain + Gemini Flash."
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pipeline and settings once
rag_chain = get_rag_pipeline()
settings = get_settings()

# Request models
class ChatRequest(BaseModel):
    message: str

class VoiceRequest(BaseModel):
    text: str

# Chat endpoint
@app.post("/chat")
async def chat(req: ChatRequest):
    user_question = req.message.strip()

    if not user_question:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        response_data = rag_chain.generate_response(user_question)
        response = response_data["response"]
        return {
            "response": response,
            "sender": "jarvis",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error in /chat: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# New chat endpoint
@app.post("/new_chat")
async def new_chat():
    try:
        pipeline = get_rag_pipeline()
        success = pipeline.clear_memory()
        return {
            "message": "New chat started.",
            "timestamp": datetime.now().isoformat(),
            "memory_cleared": success
        }
    except Exception as e:
        print(f"❌ Error clearing memory: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset chat memory.")

# TTS endpoint using Cartesia
@app.post("/voice")
async def voice(req: VoiceRequest):
    transcript = req.text.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="No text provided.")

    if not settings.cartesia_api_key:
        raise HTTPException(status_code=500, detail="CARTESIA_API_KEY is not set")

    try:
        client = Cartesia(api_key=settings.cartesia_api_key)
        audio_stream = client.tts.bytes(
            model_id="sonic-2",
            transcript=transcript,
            voice={
                "mode": "id",
                "id": settings.voice_id
            },
            output_format={
                "container": "wav",
                "encoding": "pcm_f32le",
                "sample_rate": 44100,
            },
        )

        # ✅ Stream the generator directly
        return StreamingResponse(audio_stream, media_type="audio/wav")

    except Exception as e:
        print(f"❌ Error in /voice: {e}")
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

# Health check
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# Root route
@app.get("/")
async def root():
    return {
        "message": "JARVIS API",
        "version": "1.0",
        "description": "Chatbot for answering questions about Ankit.",
        "endpoints": ["/chat", "/new_chat", "/voice", "/health"],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
