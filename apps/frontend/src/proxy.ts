import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/?auth=true", req.url));
  }

  return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        "/admin",
        "/profile",
        "/problems"
    ]
}