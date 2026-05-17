import { NextResponse } from 'next/server'

// Dummy API: returns a fake refresh token in the same shape the frontend expects
export async function POST(request: Request) {
  console.log("Received refresh token request");
  const { refresh_token } = await request.json();
  const fakeRefreshToken = `refresh_dummy_eda90h-9hf-9_H(H0fh-f-9h${refresh_token}`;

  // Return the fields expected by `performRefresh()`/token handlers
  return NextResponse.json(
    {
      access_token: `access_dummy_${Date.now()}`,
      refresh_token: fakeRefreshToken,
      expiry: Date.now() + 60 * 60 * 1000, // 1 hour
    },
    { status: 200 },
  );
}

export const runtime = 'edge'
