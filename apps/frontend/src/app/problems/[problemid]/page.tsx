"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import CodeMirrorComponent from "@/components/problem/CodeMirrorComponent";
import { Button } from "@/components/ui/button";
import { ProblemDetail } from "@/types/problem-types";
import useClientFetch from "@/hooks/useClientFetch";
import clientFetch from "@/lib/client-fetch";
import { getSubmissionSocketUrl } from "@/actions/get-submission-socket-url";
import type {
  SubmissionResult,
  SubmissionSocketUpdate,
  SubmissionStartResponse,
} from "@/types/submission-types";

type PageProps = {
  params: Promise<{ problemid: string }>;
};

function isSubmissionResult(value: unknown): value is SubmissionResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Record<string, unknown>;
  return (
    typeof result.submission_id === "string" &&
    result.status === "accepted" &&
    typeof result.passed_tests === "number" &&
    typeof result.total_tests === "number" &&
    typeof result.execution_time_ms === "number" &&
    Array.isArray(result.tests) &&
    result.tests.every((test: unknown) => {
      if (!test || typeof test !== "object") {
        return false;
      }
      const testResult = test as Record<string, unknown>;
      return (
        typeof testResult.name === "string" &&
        typeof testResult.input === "string" &&
        typeof testResult.expected === "string" &&
        typeof testResult.actual === "string" &&
        typeof testResult.passed === "boolean" &&
        typeof testResult.time === "string"
      );
    })
  );
}

function isSubmissionSocketUpdate(
  value: unknown
): value is SubmissionSocketUpdate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const update = value as Record<string, unknown>;
  if (update.status === "running") {
    return (
      typeof update.progress === "number" && typeof update.message === "string"
    );
  }

  return (
    update.status === "completed" &&
    update.progress === 100 &&
    isSubmissionResult(update.result)
  );
}

const init: RequestInit = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

type SubmissionStatus = "idle" | "starting" | "running" | "error";

const Page = ({ params }: PageProps) => {
  const router = useRouter();
  const [code, setCode] = useState<string>(
    "# Write your solution here\nprint('Hello, World!')"
  );
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("idle");
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const onCodeChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  const { problemid } = use(params);
  const { data, loading, error, runFetch } = useClientFetch<ProblemDetail>();

  useEffect(() => {
    void runFetch(`/api/v1/problems/${encodeURIComponent(problemid)}`, init);
  }, [problemid, runFetch]);

  useEffect(
    () => () => {
      socketRef.current?.close();
    },
    []
  );

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 text-slate-400">
        Loading problem...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 text-red-400">
        Error fetching problem: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 text-slate-400">
        No problem details available.
      </div>
    );
  }

  const handleSubmit = async () => {
    if (submissionStatus === "starting" || submissionStatus === "running") {
      return;
    }

    setSubmissionStatus("starting");
    setSubmissionProgress(0);
    setSubmissionError(null);

    try {
      const response = await clientFetch<SubmissionStartResponse>(
        "/api/v1/submission/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem_id: data.id,
            code,
            language: "python",
          }),
        }
      );

      if (!response.success) {
        throw new Error(response.error.message);
      }

      const submissionId = response.data.submission_id;
      const socketUrl = await getSubmissionSocketUrl(submissionId);
      const result = await new Promise<SubmissionResult>((resolve, reject) => {
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;
        let completed = false;

        const timeout = window.setTimeout(() => {
          socket.close();
          reject(new Error("Submission timed out while waiting for results."));
        }, 15_000);

        socket.onopen = () => {
          setSubmissionStatus("running");
        };
        socket.onmessage = (event: MessageEvent<string>) => {
          let update: unknown;
          try {
            update = JSON.parse(event.data) as unknown;
          } catch {
            window.clearTimeout(timeout);
            socket.close();
            reject(new Error("Received an invalid submission update."));
            return;
          }

          if (!isSubmissionSocketUpdate(update)) {
            window.clearTimeout(timeout);
            socket.close();
            reject(new Error("Received an invalid submission update."));
            return;
          }

          if (update.status === "running") {
            setSubmissionProgress(update.progress);
            return;
          }

          if (update.result.submission_id !== submissionId) {
            window.clearTimeout(timeout);
            socket.close();
            reject(new Error("Received an unexpected submission result."));
            return;
          }

          completed = true;
          window.clearTimeout(timeout);
          setSubmissionProgress(100);
          socket.close();
          resolve(update.result);
        };
        socket.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("Could not connect to the submission socket."));
        };
        socket.onclose = () => {
          if (!completed) {
            window.clearTimeout(timeout);
            reject(
              new Error("Submission socket closed before returning a result.")
            );
          }
        };
      });

      router.push(`/submissions/${encodeURIComponent(result.submission_id)}`);
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to submit solution."
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-375">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/problems"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
          >
            ← Back to problems
          </Link>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            Problem #{data.id}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
            <div className="border-b border-slate-800 px-6 py-5">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    data.difficulty === "easy"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : data.difficulty === "medium"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-rose-400/10 text-rose-400"
                  }`}
                >
                  {data.difficulty}
                </span>
                <span className="text-xs text-slate-500">
                  Updated {data.updated_at}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {data.title}
              </h1>
            </div>

            <article className="max-h-[calc(100vh-17rem)] overflow-y-auto px-6 py-6 text-slate-300 [&_a]:text-cyan-400 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-500 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-cyan-300 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:my-4 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-slate-200 [&_strong]:font-semibold [&_strong]:text-white [&_ul]:my-4">
              <ReactMarkdown>{data.description}</ReactMarkdown>
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <p className="font-semibold text-white">Your solution</p>
                <p className="text-xs text-slate-500">
                  Write your solution and submit it when you are ready.
                </p>
              </div>
              <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                Python
              </span>
            </div>
            <CodeMirrorComponent value={code} onChange={onCodeChange} />
            <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                {submissionStatus === "starting" ||
                submissionStatus === "running" ? (
                  <div className="flex items-center gap-2 text-sm text-cyan-300">
                    <LoaderCircle className="size-4 animate-spin" />
                    <span>
                      {submissionStatus === "starting"
                        ? "Starting submission..."
                        : `Running tests... ${submissionProgress}%`}
                    </span>
                  </div>
                ) : submissionStatus === "error" ? (
                  <p className="flex items-center gap-2 text-sm text-rose-400">
                    <TriangleAlert className="size-4 shrink-0" />
                    {submissionError}
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="size-4 text-slate-600" />
                    Your code will be evaluated against the test cases.
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={
                  submissionStatus === "starting" ||
                  submissionStatus === "running"
                }
                className="bg-cyan-500 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {submissionStatus === "starting" ||
                submissionStatus === "running"
                  ? "Submitting..."
                  : submissionStatus === "error"
                    ? "Retry submission"
                    : "Submit solution"}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Page;
