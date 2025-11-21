import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router
from core.config import settings

app = FastAPI(title="Intelligence Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True
)

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)