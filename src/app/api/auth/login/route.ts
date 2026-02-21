import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Simple demo validation
  if (!email || !password) {
    return NextResponse.json(
      { message: "Missing credentials" },
      { status: 400 }
    );
  }

  // Dummy role logic
  const role = email === "admin@test.com" ? "Admin" : "User";

  const token = jwt.sign(
    { userId: 1, role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  const response = NextResponse.json({
    message: "Login successful ✅",
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
  });

  return response;
}