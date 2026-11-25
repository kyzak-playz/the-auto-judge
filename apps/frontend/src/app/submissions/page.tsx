"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, XCircle } from "lucide-react";

import useClientFetch from "@/hooks/useClientFetch";
import type { SubmissionListItem } from "@/types/submission-types";

export default function SubmissionsPage() {
  const { data, error, loading, runFetch } =
    useClientFetch<SubmissionListItem[]>();
  const submissions = data ?? [];

  useEffect(() => {
    void runFetch("/api/v1/submission/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  }, [runFetch]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-5 py-10 text-slate-100 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Your activity
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Submission history.
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Review your recent attempts and open their evaluation results.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            <span className="font-semibold text-white">
              {submissions.length}
            </span>{" "}
            submissions
          </div>
        </header>

        {loading && (
          <p className="py-16 text-center text-slate-400">
            Loading submissions...
          </p>
        )}
        {error && (
          <p className="py-16 text-center text-rose-400">
            Error fetching submissions: {error.message}
          </p>
        )}
        {!loading && !error && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {submissions.length} recent submissions
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {submissions.map((submission) => {
                const accepted = submission.status === "accepted";

                return (
                  <Link
                    key={submission.submission_id}
                    href={`/submissions/${encodeURIComponent(submission.submission_id)}`}
                    className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {accepted ? (
                          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="size-5 shrink-0 text-rose-400" />
                        )}
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-white group-hover:text-indigo-200">
                            {submission.problem_title}
                          </h2>
                          <p className="mt-1 truncate font-mono text-xs text-slate-500">
                            {submission.submission_id}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-slate-600 transition group-hover:text-indigo-300" />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800 pt-4 text-sm">
                      <span
                        className={
                          accepted ? "text-emerald-300" : "text-rose-300"
                        }
                      >
                        {submission.status.replaceAll("_", " ")}
                      </span>
                      <span className="text-slate-400">
                        {submission.passed_tests}/{submission.total_tests} tests
                      </span>
                      <span className="text-slate-400">
                        {submission.language}
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 className="size-3.5" />
                        {new Date(submission.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {submissions.length === 0 && (
              <p className="py-16 text-center text-slate-400">
                No submissions yet. Try solving a problem to get started.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
