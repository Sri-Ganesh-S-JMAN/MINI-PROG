import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("Entered Email:", email);
    console.log("Entered Password:", password);

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password ❌" },
        { status: 400 }
      );
    }

    const validEmail = "admin@test.com";
    const validPassword = "admin123";
    const role = "Admin";

    if (
      email.toLowerCase() !== validEmail.toLowerCase() ||
      password !== validPassword
    ) {
      return NextResponse.json(
        { message: "Invalid credentials ❌" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: 1, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Login successful ✅",
      token,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error ❌" },
      { status: 500 }
    );
  }
}