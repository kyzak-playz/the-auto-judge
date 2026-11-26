"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type PublicProblem = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
};

const difficultyClassMap: Record<PublicProblem["difficulty"], string> = {
  easy: "text-emerald-300 border-emerald-500/30",
  medium: "text-amber-300 border-amber-500/30",
  hard: "text-rose-300 border-rose-500/30",
};

export function PublicProblems() {
  const [problems, setProblems] = useState<PublicProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProblems() {
      const { data, error: queryError } = await supabase
        .from("problem")
        .select("id,title,difficulty")
        .order("created_at", { ascending: false })
        .limit(10);

      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }

      setProblems((data ?? []) as PublicProblem[]);
      setLoading(false);
    }

    void loadProblems();
  }, []);

  return (
    <section
      id="problems"
      className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8"
      aria-labelledby="public-problems-title"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
          Start here
        </p>
        <h2
          id="public-problems-title"
          className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Public Problems
        </h2>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-5 text-sm text-zinc-300 sm:px-5">
          Loading public problems...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 px-4 py-5 text-sm text-rose-200 sm:px-5">
          Unable to load public problems: {error}
        </div>
      ) : null}

      {!loading && !error && problems.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-5 text-sm text-zinc-300 sm:px-5">
          No public problems found.
        </div>
      ) : null}

      {!loading && !error && problems.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {problems.map((problem) => (
            <li
              key={problem.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-5 py-5 text-sm transition hover:border-indigo-400/40 hover:bg-slate-900"
            >
              <span className="font-medium text-zinc-100">{problem.title}</span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs capitalize ${difficultyClassMap[problem.difficulty]}`}
              >
                {problem.difficulty}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
