import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma"; // ✅ Import Prisma

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Find user in database using Prisma
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Include role information
    });

    // If user not found
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = password == user.password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.roleId,
        roleName: user.role.name,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Set token in HTTP-only cookie
    const response = NextResponse.json({
      message: "Login successful",
      token,
      role: user.roleId,
      roleName: user.role.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 1 day in seconds
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}