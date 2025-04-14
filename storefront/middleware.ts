import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const cacheIdCookie = request.cookies.get("_zion_canvas_id")?.value;

  if (cacheIdCookie) {
    return NextResponse.next();
  }

  const cacheId = crypto.randomUUID();

  const response = NextResponse.next();

  response.cookies.set("_zion_canvas_id", cacheId);

  return response;
}
