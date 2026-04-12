import { Hero } from "@/components/home/hero";
import { PublicProblems } from "@/components/home/public-problems";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <PublicProblems />
    </main>
  );
}
