from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    groq_api_key: str
    groq_model: str = "llama-3.1-8b-instant"
    
    @field_validator('groq_api_key')
    @classmethod
    def validate_groq_api_key(cls, v):
        if not v or not v.strip():
            raise ValueError('GROQ_API_KEY не може бути порожнім')
        return v.strip()
    port: int = 8084
    host: str = "0.0.0.0"
    allowed_origins: list[str] = ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"

settings = Settings()