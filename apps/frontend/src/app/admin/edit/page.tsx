"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Copy, Eye, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProblemDifficulty } from "@/types/problem-types";

type TestCase = {
  id: number;
  input: string;
  output: string;
  hidden: boolean;
};

type EditableProblem = {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  timeLimit: number;
  memoryLimit: number;
  language: string;
  testCases: TestCase[];
};

const mockProblem: EditableProblem = {
  id: "8b3e2c1a-7f42-4d6a-b901-5d2a4c8e7f10",
  title: "Two Sum",
  description:
    "Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\n## Example\n\n```text\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\n```\n\n## Constraints\n\n- \u0060\u0032 <= nums.length <= 10^4\u0060\n- \u0060\u002d10^9 <= nums[i] <= 10^9\u0060\n- \u0060\u002d10^9 <= target <= 10^9\u0060",
  difficulty: ProblemDifficulty.MEDIUM,
  timeLimit: 2,
  memoryLimit: 256,
  language: "Python",
  testCases: [
    {
      id: 1,
      input: "[2, 7, 11, 15]\n9",
      output: "[0, 1]",
      hidden: false,
    },
    {
      id: 2,
      input: "[3, 2, 4]\n6",
      output: "[1, 2]",
      hidden: false,
    },
    {
      id: 3,
      input: "[3, 3]\n6",
      output: "[0, 1]",
      hidden: true,
    },
  ],
};

const difficultyStyles: Record<ProblemDifficulty, string> = {
  [ProblemDifficulty.EASY]:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  [ProblemDifficulty.MEDIUM]:
    "border-amber-400/30 bg-amber-400/10 text-amber-300",
  [ProblemDifficulty.HARD]: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

function EditProblemContent({
  requestedUuid,
}: {
  requestedUuid: string | null;
}) {
  const [problem, setProblem] = useState<EditableProblem>({
    ...mockProblem,
    id: requestedUuid || mockProblem.id,
  });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePreview, setActivePreview] = useState(false);

  const visibleTestCases = useMemo(
    () => problem.testCases.filter((testCase) => !testCase.hidden).length,
    [problem.testCases]
  );

  const updateProblem = <K extends keyof EditableProblem>(
    field: K,
    value: EditableProblem[K]
  ) => {
    setProblem((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const updateTestCase = (
    id: number,
    field: "input" | "output" | "hidden",
    value: string | boolean
  ) => {
    setProblem((current) => ({
      ...current,
      testCases: current.testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, [field]: value } : testCase
      ),
    }));
    setSaved(false);
  };

  const addTestCase = () => {
    setProblem((current) => ({
      ...current,
      testCases: [
        ...current.testCases,
        {
          id:
            Math.max(0, ...current.testCases.map((testCase) => testCase.id)) +
            1,
          input: "",
          output: "",
          hidden: false,
        },
      ],
    }));
  };

  const removeTestCase = (id: number) => {
    setProblem((current) => ({
      ...current,
      testCases: current.testCases.filter((testCase) => testCase.id !== id),
    }));
  };

  const copyUuid = async () => {
    await navigator.clipboard?.writeText(problem.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const saveProblem = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-indigo-300"
            >
              <ArrowLeft className="size-4" />
              Back to admin
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Edit problem
              </h1>
              <Badge
                variant="outline"
                className={`${difficultyStyles[problem.difficulty]} uppercase`}
              >
                {problem.difficulty}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => setActivePreview((current) => !current)}
            >
              <Eye />
              {activePreview ? "Edit" : "Preview"}
            </Button>
            <Button
              onClick={saveProblem}
              className="min-w-28 bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {saved ? <Check /> : <Save />}
              {saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Problem UUID
            </p>
            <p className="truncate font-mono text-sm text-slate-300">
              {problem.id}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyUuid}
            className="border-slate-700 bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy UUID"}
          </Button>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="border-b border-slate-800 px-5 py-4">
                <h2 className="font-semibold text-white">Problem details</h2>
              </div>
              <div className="space-y-5 p-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Title
                  </span>
                  <input
                    value={problem.title}
                    onChange={(event) =>
                      updateProblem("title", event.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
                  />
                </label>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">
                      Description
                    </span>
                    <span className="text-xs text-slate-500">
                      Markdown supported
                    </span>
                  </div>
                  {activePreview ? (
                    <div className="min-h-72 whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-slate-300">
                      {problem.description}
                    </div>
                  ) : (
                    <textarea
                      value={problem.description}
                      onChange={(event) =>
                        updateProblem("description", event.target.value)
                      }
                      className="min-h-72 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-200 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15"
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/70">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-white">Test cases</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {visibleTestCases} public ·{" "}
                    {problem.testCases.length - visibleTestCases} hidden
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTestCase}
                  className="border-indigo-400/20 bg-indigo-400/10 text-indigo-300 hover:bg-indigo-400/20 hover:text-indigo-200"
                >
                  <Plus />
                  Add case
                </Button>
              </div>

              <div className="divide-y divide-slate-800">
                {problem.testCases.map((testCase, index) => (
                  <div key={testCase.id} className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-slate-300">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-300">
                          Test case
                        </span>
                        {testCase.hidden && (
                          <Badge
                            variant="outline"
                            className="border-slate-700 text-slate-500"
                          >
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTestCase(testCase.id)}
                        className="rounded-md p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-400"
                        aria-label={`Remove test case ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label>
                        <span className="mb-2 block text-xs font-medium text-slate-500">
                          Input
                        </span>
                        <textarea
                          value={testCase.input}
                          onChange={(event) =>
                            updateTestCase(
                              testCase.id,
                              "input",
                              event.target.value
                            )
                          }
                          className="min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none focus:border-indigo-500"
                          placeholder="Enter test input"
                        />
                      </label>
                      <label>
                        <span className="mb-2 block text-xs font-medium text-slate-500">
                          Expected output
                        </span>
                        <textarea
                          value={testCase.output}
                          onChange={(event) =>
                            updateTestCase(
                              testCase.id,
                              "output",
                              event.target.value
                            )
                          }
                          className="min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200 outline-none focus:border-indigo-500"
                          placeholder="Enter expected output"
                        />
                      </label>
                    </div>

                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={testCase.hidden}
                        onChange={(event) =>
                          updateTestCase(
                            testCase.id,
                            "hidden",
                            event.target.checked
                          )
                        }
                        className="size-4 accent-indigo-500"
                      />
                      Hidden test case
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-4 font-semibold text-white">Configuration</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Difficulty
                  </span>
                  <select
                    value={problem.difficulty}
                    onChange={(event) =>
                      updateProblem(
                        "difficulty",
                        event.target.value as ProblemDifficulty
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value={ProblemDifficulty.EASY}>Easy</option>
                    <option value={ProblemDifficulty.MEDIUM}>Medium</option>
                    <option value={ProblemDifficulty.HARD}>Hard</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Default language
                  </span>
                  <select
                    value={problem.language}
                    onChange={(event) =>
                      updateProblem("language", event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option>Python</option>
                    <option>C++</option>
                    <option>JavaScript</option>
                    <option>Java</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="mb-2 block text-xs font-medium text-slate-500">
                      Time limit
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={problem.timeLimit}
                        onChange={(event) =>
                          updateProblem("timeLimit", Number(event.target.value))
                        }
                        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 pr-8 text-sm text-slate-200 outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500">
                        s
                      </span>
                    </div>
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-medium text-slate-500">
                      Memory
                    </span>
                    <div className="relative">
                      <input
                        type="number"
                        min="16"
                        step="16"
                        value={problem.memoryLimit}
                        onChange={(event) =>
                          updateProblem(
                            "memoryLimit",
                            Number(event.target.value)
                          )
                        }
                        className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 pr-10 text-sm text-slate-200 outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500">
                        MB
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="mb-4 font-semibold text-white">Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Test cases</dt>
                  <dd className="text-slate-300">{problem.testCases.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Public cases</dt>
                  <dd className="text-slate-300">{visibleTestCases}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Language</dt>
                  <dd className="text-slate-300">{problem.language}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="flex items-center gap-1.5 text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Draft
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function EditProblemPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center text-sm text-slate-400">
          Loading problem editor...
        </main>
      }
    >
      <EditProblemRoute />
    </Suspense>
  );
}

function EditProblemRoute() {
  const searchParams = useSearchParams();
  const requestedUuid = searchParams.get("uuid");

  return (
    <EditProblemContent
      key={requestedUuid || "default"}
      requestedUuid={requestedUuid}
    />
  );
}
