import {
    Card,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    CardContent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {ProblemList} from "@/types/problem-types";
import Link from "next/link"

const ProblemCard = ({ id, title, difficulty, updated_at }: ProblemList) => {
    return (
        <Link href={`/problems/${id}`}>
            <Card className="bg-black/60 flex h-full flex-col transition-colors cursor-pointer hover:shadow-inner hover:shadow-blue-500">
                <CardHeader>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <Badge variant={difficulty === "easy" ? "default" : difficulty === "medium" ? "outline" : "destructive"}>
                            {difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{id}</span>
                    </div>
                    <CardTitle className="line-clamp-1">{title}</CardTitle>
                    {/* <CardDescription className="line-clamp-2">{description}</CardDescription> */}
                </CardHeader>

                {/* Content is being hidden in the current design (because of MVP ) */}
                {/* <CardContent className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="font-normal">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent> */}
                
                <CardFooter className="text-sm text-muted-foreground">
                    <span>Updated: {updated_at}</span>
                </CardFooter>
            </Card>
        </Link>
    )
}

export default ProblemCard