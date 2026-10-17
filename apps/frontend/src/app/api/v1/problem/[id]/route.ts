import { NextRequest, NextResponse} from "next/server";
import { ProblemDifficulty, ProblemList, ProblemDetail } from "@/types/problem-types";

const mockResponse: ProblemList[] = [
        {
            id: '1',
            title: 'Sample Problem 1',
            difficulty: ProblemDifficulty.EASY,
            updated_at: new Date().toDateString(),
        },
        {
            id: '2',
            title: 'Sample Problem 2',
            difficulty: ProblemDifficulty.MEDIUM,
            updated_at: new Date().toDateString(),
        },
        {
            id: '3',
            title: 'Sample Problem 3',
            difficulty: ProblemDifficulty.HARD,
            updated_at: new Date().toDateString(),
        },
];
type QueryParams = {
    params : Promise<{id : string}>;
}
export async function GET(request: NextRequest, {params}: QueryParams) {
    console.log("GET request received for problem detail");
    const {id} = await params;

    if (!id) {
        return new Response('ID is required', { status: 400 });
    }

    // Find the problem with the matching ID
    const problem = mockResponse.find((p) => p.id === id);
    console.log(problem)

    if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // create a mock problem detail object based on the found problem
    const problemDetail: ProblemDetail = {
        ...problem[],
        description: `This is a detailed description for ${problem.title}.`,
    };

    return NextResponse.json(problemDetail, { status: 200 });
}