from fastapi import FastAPI
from .api.v1.auth.sigin import router as signin_router

app = FastAPI(title="The Auto Judge Backend")
app.include_router(signin_router)
