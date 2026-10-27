from pydantic import BaseModel


class TestCase(BaseModel):
    input: list[str]
    output: str
    hidden: bool
