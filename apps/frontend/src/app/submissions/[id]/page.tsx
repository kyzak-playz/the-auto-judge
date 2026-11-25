"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Code2, Info, XCircle } from "lucide-react";

import useClientFetch from "@/hooks/useClientFetch";
import type { SubmissionDetail } from "@/types/submission-types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function SubmissionResultPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    data: result,
    error,
    loading,
    runFetch,
  } = useClientFetch<SubmissionDetail>();

  useEffect(() => {
    void runFetch(`/api/v1/submission/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  }, [id, runFetch]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 text-slate-400">
        Fetching submission result...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 text-center text-rose-400">
        Could not load submission result: {error.message}
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 text-center text-slate-400">
        Submission result not found.
      </main>
    );
  }

  const accepted = result.status === "accepted";
  const passedTests = result.tests.filter((test) => test.passed).length;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href={`/problems/${encodeURIComponent(result.problem_id)}`}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
            >
              ← Back to problem
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Submission result
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {result.problem_title}
            </h1>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Submission ID
            </p>
            <p className="mt-1 font-mono text-sm text-slate-300">
              {result.submission_id}
            </p>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div
            className={`rounded-2xl border p-5 ${
              accepted
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-rose-500/20 bg-rose-500/10"
            }`}
          >
            <div className="flex items-center gap-3">
              {accepted ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <XCircle className="size-5 text-rose-400" />
              )}
              <p
                className={`text-sm font-medium ${
                  accepted ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {result.status.replaceAll("_", " ")}
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {passedTests}/{result.total_tests} tests passed
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="size-5 text-cyan-400" />
              <p className="text-sm font-medium text-slate-300">
                Execution time
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {result.execution_time_ms} ms
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <Code2 className="size-5 text-violet-400" />
              <p className="text-sm font-medium text-slate-300">Language</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {result.language}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Submitted code</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Mock submission details returned by the backend
                </p>
              </div>
              <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                {result.language}
              </span>
            </div>
            <pre className="min-h-80 overflow-x-auto bg-slate-950 p-5 text-sm leading-6 text-slate-300">
              <code>{result.code}</code>
            </pre>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Info className="size-5 text-amber-400" />
              <div>
                <h2 className="font-semibold text-white">Mock evaluation</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Placeholder feedback for this submission
                </p>
              </div>
            </div>
            <p className="leading-7 text-slate-300">
              This result is served from predefined backend mock data. The real
              judge can replace this response when submission persistence and
              execution are connected.
            </p>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold text-white">Test results</h2>
            <p className="mt-1 text-xs text-slate-500">
              Mock results fetched from the submission detail endpoint
            </p>
          </div>
          <div className="divide-y divide-slate-800">
            {result.tests.map((test) => (
              <div
                key={test.name}
                className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center"
              >
                <div className="flex items-start gap-3">
                  {test.passed ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-rose-400" />
                  )}
                  <div>
                    <p className="font-medium text-white">{test.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{test.input}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Expected
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-300">
                    {test.expected}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Actual
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-300">
                    {test.actual}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm font-medium text-slate-300">
                    {test.passed ? "Passed" : "Failed"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{test.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
