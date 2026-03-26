from fastapi import APIRouter

router = APIRouter()


@router.get("/", summary="Hello world endpoint")
def hello_world() -> dict[str, str]:
    return {"message": "Hello world"}
