import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const password = process.env.DASHBOARD_PASSWORD ?? "";
  const expected = `Basic ${Buffer.from(`:${password}`).toString("base64")}`;

  if (!password || auth !== expected) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="VGM Dashboard"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
