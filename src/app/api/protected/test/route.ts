import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized ❌" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    return NextResponse.json({
      message: "You accessed protected route ✅",
      user: decoded,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired token ❌" },
      { status: 401 }
    );
  }
}