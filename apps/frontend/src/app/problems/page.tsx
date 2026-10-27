"use client";

import { useEffect, useState } from "react";
import ProblemCard from "@/components/shared/ProblemCard";
import useClientFetch from "@/hooks/useClientFetch";
import { ProblemList } from "@/types/problem-types";

export default function ProblemsPage() {
  const [filter, setFilter] = useState("All difficulties");
  const { data, error, loading, runFetch } = useClientFetch<ProblemList[]>();
  const problems = data ?? [];

  useEffect(() => {
    void runFetch("/api/v1/problems", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, [runFetch]);

  const searchProblems = () => {
    const query =
      filter === "All difficulties"
        ? ""
        : `?difficulty=${encodeURIComponent(filter)}`;

    void runFetch(`/api/v1/problems${query}`);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] px-5 py-10 text-slate-100 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Problem library
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Find your next challenge.
            </h1>
            <p className="mt-3 max-w-xl text-slate-400">
              Sharpen your skills with curated coding challenges, from first
              steps to advanced algorithms.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            <span className="font-semibold text-white">{problems.length}</span>{" "}
            challenges available
          </div>
        </header>

        <section className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3 sm:flex-row">
          <select
            aria-label="Filter by difficulty"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300 outline-none focus:border-indigo-500"
          >
            <option>All difficulties</option>
            <option>easy</option>
            <option>medium</option>
            <option>hard</option>
          </select>
          <button
            onClick={searchProblems}
            disabled={loading}
            className="rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Search
          </button>
        </section>

        {loading && (
          <p className="text-center text-slate-400">Loading problems...</p>
        )}
        {error && (
          <p className="text-center text-red-500">
            Error fetching problems: {error.message}
          </p>
        )}
        {!loading && !error && (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {problems.length} problems
            </p>
            <div className="grid gap-10 md:grid-cols-2">
              {problems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  id={problem.id}
                  title={problem.title}
                  difficulty={problem.difficulty}
                  updated_at={problem.updated_at}
                />
              ))}
            </div>
            {problems.length === 0 && (
              <p className="py-16 text-center text-slate-400">
                No problems match your search.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
