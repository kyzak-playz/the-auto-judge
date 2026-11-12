import Link from "next/link";
import { CheckCircle2, Clock3, Code2, Sparkles, XCircle } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

const submittedCode = `def two_sum(numbers, target):
    seen = {}

    for index, number in enumerate(numbers):
        complement = target - number
        if complement in seen:
            return [seen[complement], index]
        seen[number] = index

    return []`;

const tests = [
  {
    name: "Basic pair",
    input: "[2, 7, 11, 15], target = 9",
    expected: "[0, 1]",
    actual: "[0, 1]",
    passed: true,
    time: "0.42 ms",
  },
  {
    name: "Duplicate values",
    input: "[3, 3], target = 6",
    expected: "[0, 1]",
    actual: "[0, 1]",
    passed: true,
    time: "0.18 ms",
  },
  {
    name: "No matching pair",
    input: "[1, 2, 3], target = 10",
    expected: "[]",
    actual: "[]",
    passed: true,
    time: "0.15 ms",
  },
];

export default async function SubmissionResultPage({ params }: PageProps) {
  const { id } = await params;
  const passedTests = tests.filter((test) => test.passed).length;

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/problems"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-cyan-400"
            >
              ← Back to problems
            </Link>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Submission result
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Two Sum
            </h1>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Submission ID
            </p>
            <p className="mt-1 font-mono text-sm text-slate-300">{id}</p>
          </div>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-400" />
              <p className="text-sm font-medium text-emerald-300">Accepted</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {passedTests}/{tests.length} tests passed
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="size-5 text-cyan-400" />
              <p className="text-sm font-medium text-slate-300">
                Execution time
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">0.42 ms</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center gap-3">
              <Code2 className="size-5 text-violet-400" />
              <p className="text-sm font-medium text-slate-300">Language</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">Python 3</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Submitted code</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Code submitted for this attempt
                </p>
              </div>
              <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400">
                Python
              </span>
            </div>
            <pre className="min-h-80 overflow-x-auto bg-slate-950 p-5 text-sm leading-6 text-slate-300">
              <code>{submittedCode}</code>
            </pre>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="size-5 text-amber-400" />
              <div>
                <h2 className="font-semibold text-white">AI summary</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Automated feedback for this submission
                </p>
              </div>
            </div>
            <p className="leading-7 text-slate-300">
              Your solution correctly uses a hash map to find the required
              complement in one pass. It handles duplicate values and cases
              where no pair exists.
            </p>
            <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                Remark
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Good work. The approach has an estimated O(n) time complexity
                and O(n) additional space complexity.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold text-white">Test results</h2>
            <p className="mt-1 text-xs text-slate-500">
              Results from the visible test cases
            </p>
          </div>
          <div className="divide-y divide-slate-800">
            {tests.map((test) => (
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
