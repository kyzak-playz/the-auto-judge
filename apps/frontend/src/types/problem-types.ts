export type LanguageSupport = "cpp" | "python" | "javascript";

export enum ProblemDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export type ProblemFilter = {
  difficulty?: ProblemDifficulty;
  page: number;
  limit: number;
};

export type ProblemList = {
  id: string;
  title: string;
  difficulty: ProblemDifficulty;
  updated_at: string;
}

export type ProblemDetail = {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  updated_at: string;
}