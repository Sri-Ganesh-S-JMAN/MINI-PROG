import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// ✅ Force middleware to run in Node.js runtime (not Edge)
export const runtime = "nodejs";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  console.log("Middleware running for:", path);
  console.log("Token found:", !!token);

  // If no token and trying to access protected routes, redirect to login
  if (!token && path !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If no token but already on login page, allow access
  if (!token && path === "/login") {
    return NextResponse.next();
  }

  // ✅ If we reach here, token must exist (TypeScript safety check)
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists, verify it
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!); // ✅ Now token is guaranteed to be string
    
    console.log("Decoded role:", decoded.role);
 
    // If user has valid token and is on login page, redirect based on role
    if (path === "/login") {
      // Role IDs: 1=USER, 4=ADMIN, 5=AGENT, 6=MANAGER
      if (decoded.role === 4 || decoded.role === 6) {
        // ADMIN or MANAGER → dashboard
        console.log("Redirecting to dashboard");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else if (decoded.role === 1 || decoded.role === 5) {
        // USER or AGENT → tickets
        console.log("Redirecting to tickets");
        return NextResponse.redirect(new URL("/tickets", request.url));
      }
    }

    // Allow the request to continue
    return NextResponse.next();
 
  } catch (error) {
    console.error("JWT verification failed:", error);
    
    // If token is invalid and user is on login page, allow it
    if (path === "/login") {
      // Clear the invalid token
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
    
    // Otherwise redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/tickets/:path*", "/assets/:path*", "/asset-requests/:path*", "/profile/:path*"],
};