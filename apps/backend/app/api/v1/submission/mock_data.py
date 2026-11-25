from app.schemas.submit_schema import (
    SubmissionDetailSchema,
    SubmissionListItemSchema,
    SubmissionTestResultSchema,
)

MOCK_SUBMISSION_TESTS = [
    SubmissionTestResultSchema(
        name="Basic pair",
        input="[2, 7, 11, 15], target = 9",
        expected="[0, 1]",
        actual="[0, 1]",
        passed=True,
        time="0.42 ms",
    ),
    SubmissionTestResultSchema(
        name="Duplicate values",
        input="[3, 3], target = 6",
        expected="[0, 1]",
        actual="[0, 1]",
        passed=True,
        time="0.18 ms",
    ),
    SubmissionTestResultSchema(
        name="No matching pair",
        input="[1, 2, 3], target = 10",
        expected="[]",
        actual="[]",
        passed=True,
        time="0.15 ms",
    ),
]

MOCK_SUBMISSION_LIST = [
    SubmissionListItemSchema(
        submission_id="mock-submission-001",
        problem_id="8b3e2c1a-7f42-4d6a-b901-5d2a4c8e7f10",
        problem_title="Two Sum",
        status="accepted",
        submitted_at="2026-11-24T17:00:00Z",
        language="Python 3",
        passed_tests=3,
        total_tests=3,
    ),
    SubmissionListItemSchema(
        submission_id="mock-submission-002",
        problem_id="8b3e2c1a-7f42-4d6a-b901-5d2a4c8e7f10",
        problem_title="Two Sum",
        status="accepted",
        submitted_at="2026-11-24T16:42:00Z",
        language="Python 3",
        passed_tests=3,
        total_tests=3,
    ),
    SubmissionListItemSchema(
        submission_id="mock-submission-003",
        problem_id="2b3c4d5e-6f70-4a81-9234-56789abcdef0",
        problem_title="Binary Search",
        status="accepted",
        submitted_at="2026-11-24T15:18:00Z",
        language="JavaScript",
        passed_tests=3,
        total_tests=3,
    ),
]

MOCK_SUBMISSION_CODE = """def two_sum(numbers, target):
    seen = {}

    for index, number in enumerate(numbers):
        complement = target - number
        if complement in seen:
            return [seen[complement], index]
        seen[number] = index

    return []"""


def get_mock_submission(submission_id: str) -> SubmissionDetailSchema:
    return SubmissionDetailSchema(
        submission_id=submission_id,
        status="accepted",
        passed_tests=len(MOCK_SUBMISSION_TESTS),
        total_tests=len(MOCK_SUBMISSION_TESTS),
        execution_time_ms=0.42,
        tests=MOCK_SUBMISSION_TESTS,
        problem_id="8b3e2c1a-7f42-4d6a-b901-5d2a4c8e7f10",
        problem_title="Two Sum",
        code=MOCK_SUBMISSION_CODE,
        language="Python 3",
        submitted_at="2026-11-24T17:00:00Z",
    )
