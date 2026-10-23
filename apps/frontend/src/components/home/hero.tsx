import Link from "next/link";

export function Hero() {
    return (
        <section
            id="hero"
            className="relative overflow-hidden"
            aria-labelledby="hero-title"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_28rem_at_50%_-10%,rgba(99,102,241,0.25),transparent_68%)]" />
            <div className="mx-auto grid min-h-[78vh] w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                <p className="inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
                    Built for deliberate practice
                </p>
                <h1
                    id="hero-title"
                    className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
                >
                    Turn ideas into accepted solutions.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                    A focused coding arena for solving better problems, learning from feedback, and building confidence one submission at a time.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/problems" className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-400">Explore problems</Link>
                    <Link href="#problems" className="rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">Start Immediate challenge</Link>
                </div>
                </div>
                <div className="relative hidden lg:block">
                    <div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="relative rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-2xl shadow-black/30">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-300">Weekly progress</span>
                            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">+24%</span>
                        </div>
                        <div className="mb-6 flex items-end gap-2">
                            <span className="text-4xl font-bold text-white">18</span>
                            <span className="pb-1 text-sm text-slate-500">problems solved</span>
                        </div>
                        <div className="flex h-28 items-end gap-2">
                            {[35, 52, 42, 70, 58, 84, 68].map((height, index) => <div key={index} className="flex-1 rounded-t bg-indigo-500/80" style={{ height: `${height}%` }} />)}
                        </div>
                        <div className="mt-3 flex justify-between text-[11px] text-slate-600"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
