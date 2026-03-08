import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  console.log("Middleware running for:", request.nextUrl.pathname);
  console.log("Token found:", !!token);

  if (!token) {
    console.log("No token - redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Simple base64 decode check instead of full JWT verify in middleware
    // This is because JWT verification can fail in Edge runtime
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("Invalid token format");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log("Token payload:", payload);

    // Admin-only route protection
    if (
      request.nextUrl.pathname.startsWith("/dashboard/users") &&
      payload.role !== "Admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

// comment above code and uncomment below for a simpler middleware that just allows 
// all dashboard routes without auth checks (useful during development)

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   // Dev mode: allow all dashboard routes
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };