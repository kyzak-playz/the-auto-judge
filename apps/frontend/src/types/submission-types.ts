export type SubmissionStartResponse = {
  submission_id: string;
  status: "queued";
};

export type SubmissionTestResult = {
  name: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  time: string;
};

export type SubmissionResult = {
  submission_id: string;
  status: string;
  passed_tests: number;
  total_tests: number;
  execution_time_ms: number;
  tests: SubmissionTestResult[];
};

export type SubmissionDetail = SubmissionResult & {
  problem_id: string;
  problem_title: string;
  code: string;
  language: string;
  submitted_at: string;
};

export type SubmissionListItem = {
  submission_id: string;
  problem_id: string;
  problem_title: string;
  status: string;
  submitted_at: string;
  language: string;
  passed_tests: number;
  total_tests: number;
};

export type SubmissionSocketUpdate =
  | {
      status: "running";
      progress: number;
      message: string;
    }
  | {
      status: "completed";
      progress: 100;
      result: SubmissionResult;
    };
