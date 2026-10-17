import {ProblemList, ProblemFilter, ProblemDifficulty} from '@/types/problem-types'
import {NextRequest, NextResponse} from 'next/server'

// return a mock response for now, you can replace this with actual data fetching logic
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

export async function GET( req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    // extract query parameters from the request
    const difficulty = searchParams.get('difficulty') as ProblemFilter['difficulty'];
    const page = parseInt(searchParams.get('page') ?? "1");
    const limit = parseInt(searchParams.get('limit') ?? "10");

    // console log the extracted parameters for debugging
    console.log('Extracted query parameters:', {difficulty, page, limit});
    return NextResponse.json(mockResponse);
}

