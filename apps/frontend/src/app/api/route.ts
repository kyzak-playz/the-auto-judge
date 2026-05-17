import { NextRequest, NextResponse } from "next/server";

async function validateCredentials(email: string, password: string): Promise<boolean> {
    // Here you would normally validate the email and password against your database
    // For demonstration purposes, we'll just check if they are not empty
    return email === "user@example.com" && password === "2^vMxgJ*fuC8ECM$vySJ";
}

const token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.tyh-VfuzIxCyGYDlkBA7DfyjrqmSHu6pQ2hoZuFqUSLPNY2N0mpHb3nk5K17HWP_3cYHBw7AhHale5wky6-sVA";


export async function POST(request: NextRequest): Promise<NextResponse> {
    const { email, password, authMode } = await request.json();
    if (authMode === "signup") {
        console.log("Signing up user:", email);
    } else {
        console.log("Logging in user:", email);
    }
    // Here you would normally validate the email and password against your database
    // For demonstration purposes, we'll just return a fake user session if the email and password are not empty
    if (await validateCredentials(email, password)) {
        return NextResponse.json(
            {access_token: token, refresh_token: "new_fake-refresh-token", expiry: Date.now() + 3600 * 1000},
            {status: 200}
        );
    } else {
        console.log("Invalid credentials for user:", email);
        return NextResponse.json({
            success: false,
            error: {
                message: "Invalid email or password",
                code: 401,
                type: "AuthenticationError",
            },
        }, { status: 401 });
    }
}

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ message: "This is the API route for authentication" });
}