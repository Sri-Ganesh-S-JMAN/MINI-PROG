import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1️⃣ Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    // 2️⃣ Dummy users (Replace with DB later)
    const users = [
      {
        email: "admin@test.com",
        password: "admin123",
        role: "Admin",
      },
      {
        email: "user@test.com",
        password: "user123",
        role: "User",
      },
    ];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    // 3️⃣ If no user found
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password ❌" },
        { status: 401 }
      );
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      { userId: 1, role: user.role },
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
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}