"use client";

import { useState, useEffect } from "react";
import ProblemCard from "@/components/shared/ProblemCard";
import { ProblemList } from "@/types/problem-types";

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemList[]>([]);
  // fetch problems from the API when the component mounts
  useEffect(()=> {
    const fetchProblems = async () => {
      try {
        const response = await fetch("/api/v1/problem");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ProblemList[] = await response.json();
        console.log("data", data)
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      }
    };
    fetchProblems();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl my-6">
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Practice arena</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Problems</h1>
          <p className="mt-3 max-w-xl text-slate-400">Sharpen your skills with curated coding challenges, from first steps to advanced algorithms.</p>
        </header>
        {/* Search and filter inputs */}
        {/* <section className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input aria-label="Search problems" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems, tags..." className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-500" />
          <select aria-label="Filter by difficulty" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-slate-300 outline-none focus:border-cyan-500">
            <option>All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </section> */}

        <p className="mb-4 text-sm text-slate-500">{problems.length} problems</p>
        <div className="grid gap-10 md:grid-cols-2">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} id={problem.id} title={problem.title} difficulty={problem.difficulty} updated_at={problem.updated_at}/>
          ))}
        </div>
        {problems.length === 0 && <p className="py-16 text-center text-slate-400">No problems match your search.</p>}
      </div>
    </main>
  );
}
