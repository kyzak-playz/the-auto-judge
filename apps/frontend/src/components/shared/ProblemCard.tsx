import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProblemList } from "@/types/problem-types";
import Link from "next/link";

const ProblemCard = ({ id, title, difficulty, updated_at }: ProblemList) => {
  return (
    <Link href={`/problems/${id}`} className="group block">
      <Card className="flex h-full flex-col border-slate-800 bg-slate-900/70 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-indigo-400/50 group-hover:bg-slate-900 group-hover:shadow-xl group-hover:shadow-indigo-950/30">
        <CardHeader>
          <div className="mb-3 flex items-center justify-between gap-3">
            <Badge
              className={
                difficulty === "easy"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : difficulty === "medium"
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : "border-rose-400/20 bg-rose-400/10 text-rose-300"
              }
              variant="outline"
            >
              {difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">#{id}</span>
          </div>
          <CardTitle className="line-clamp-2 text-lg text-slate-100 transition-colors group-hover:text-indigo-200">
            {title}
          </CardTitle>
        </CardHeader>

        <CardFooter className="mt-auto flex items-center justify-between border-t border-slate-800/80 pt-4 text-sm text-slate-500">
          <span>Updated {updated_at}</span>
          <span className="text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
            Open →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProblemCard;
