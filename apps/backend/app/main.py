from fastapi import FastAPI

from app.api.v1.endpoints.hello import router as hello_router

app = FastAPI(title="The Auto Judge Backend")
app.include_router(hello_router)
