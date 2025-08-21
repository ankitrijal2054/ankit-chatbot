from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    google_api_key: str
    cartesia_api_key: str
    embeddings_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    persist_directory: str = "chroma_db"
    cors_origins: List[str] = ["*"]
    cartesia_voice_id: str

    class Config:
        env_file = ".env"

def get_settings():
    return Settings()
