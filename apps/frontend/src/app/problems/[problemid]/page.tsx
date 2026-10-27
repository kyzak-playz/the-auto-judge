"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import CodeMirrorComponent from "@/components/problem/CodeMirrorComponent";
import { Button } from "@/components/ui/button";
import { ProblemDetail } from "@/types/problem-types";
import useClientFetch from "@/hooks/useClientFetch";
import { submitCode } from "@/actions/submit-code";

type PageProps = {
  params: Promise<{ problemid: string }>;
};

const init: RequestInit = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const Page = ({ params }: PageProps) => {
  // Create state for submit data
  const [code, setCode] = useState<string>(
    "# Write your solution here\nprint('Hello, World!')"
  );
  // on change submit functon
  const onCodeChange = useCallback((val: string) => {
    setCode(val);
  }, []);

  const { problemid } = use(params);
  const { data, loading, error, runFetch } = useClientFetch<ProblemDetail>();

  useEffect(() => {
    void runFetch(`/api/v1/problems/${encodeURIComponent(problemid)}`, init);
  }, [problemid, runFetch]);

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

  // Function to handle code submission
  const handleSubmit = async () => {
    try {
      await submitCode(code);
      console.log("Code submitted successfully");
    } catch (error) {
      console.error("Error submitting code:", error);
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
            <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
              <p className="text-xs text-slate-500">
                Your code will be evaluated against hidden test cases.
              </p>
              <Button
                onClick={handleSubmit}
                className="bg-cyan-500 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Submit solution
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Page;
