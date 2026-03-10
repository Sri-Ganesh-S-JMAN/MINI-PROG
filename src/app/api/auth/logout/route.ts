import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  );
  
  // Clear the token cookie
  response.cookies.delete("token");
  
  return response;
}
