const placeholderProblems = [
    { title: "Two Sum", difficulty: "Easy" },
    { title: "Balanced Parentheses", difficulty: "Easy" },
    { title: "Top K Frequent Elements", difficulty: "Medium" },
    { title: "Number of Islands", difficulty: "Medium" },
    { title: "Median of Two Sorted Arrays", difficulty: "Hard" },
];

export function PublicProblems() {
    return (
        <section
            id="problems"
            className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8"
            aria-labelledby="public-problems-title"
        >
            <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                    Explore
                </p>
                <h2
                    id="public-problems-title"
                    className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
                >
                    Public Problems
                </h2>
            </div>

            <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-zinc-900/40">
                {placeholderProblems.map((problem) => (
                    <li
                        key={problem.title}
                        className="flex items-center justify-between px-4 py-4 text-sm sm:px-5"
                    >
                        <span className="font-medium text-zinc-100">{problem.title}</span>
                        <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-zinc-300">
                            {problem.difficulty}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
