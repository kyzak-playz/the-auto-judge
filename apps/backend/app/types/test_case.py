from typing import Any, TypedDict


class ProblemTestCases(TypedDict):
    inputs: list[list[Any]]
    fn_name: str
    outputs: list[Any]
