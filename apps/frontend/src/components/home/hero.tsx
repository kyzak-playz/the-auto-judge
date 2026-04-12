export function Hero() {
    return (
        <section
            id="hero"
            className="relative overflow-hidden border-b border-white/10"
            aria-labelledby="hero-title"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_35rem_at_50%_-10%,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="mx-auto flex min-h-[82vh] w-full max-w-6xl flex-col justify-center px-6 py-20 sm:px-8">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
                    The Auto Judge
                </p>
                <h1
                    id="hero-title"
                    className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl md:text-6xl"
                >
                    Practice coding with fast judging and clearer feedback.
                </h1>
                <p className="mt-5 max-w-2xl text-zinc-400 sm:text-lg">
                    Submit solutions, review outcomes, and iterate quickly with a clean,
                    focused workflow built for learning.
                </p>
            </div>
        </section>
    );
}
