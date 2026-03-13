import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-20">
      <section className="w-full rounded-2xl border border-white/10 bg-zinc-900/70 p-8 backdrop-blur sm:p-12">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Sprint 1</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          The Auto Judge Frontend
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Base frontend scaffold is ready with Next.js, TypeScript, Tailwind CSS,
          and shadcn-compatible utilities.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Start Building</Button>
          <Button variant="outline">Read Architecture</Button>
        </div>
      </section>
    </main>
  );
}
