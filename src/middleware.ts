import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import next from "next"
 
export function middleware(req: NextRequest) {
 
  const token = req.cookies.get("token")?.value
  const path = req.nextUrl.pathname

  if (path==="/login")
  {
    return NextResponse.next();
  }


  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
 
  try {
    const decoded:any = jwt.verify(token, process.env.JWT_SECRET!)
 
    if(decoded.role === "ADMIN"){
      if(req.nextUrl.pathname === "/login"){
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }
 
    if(decoded.role === "USER"){
      if(req.nextUrl.pathname === "/login"){
        return NextResponse.redirect(new URL("/tickets", req.url))
      }
    }
 
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ["/dashboard/:path*","/tickets/:path*"]
}