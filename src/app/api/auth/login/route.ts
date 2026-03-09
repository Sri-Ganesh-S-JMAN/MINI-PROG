import { NextResponse } from "next/server"
import { Pool } from "pg"
import jwt from "jsonwebtoken"
 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
 
export async function POST(req: Request) {
 
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
      )
    }
 
    const user = result.rows[0]
 
    // check password
    if (user.password !== password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }
 
    // create JWT token
    const token = jwt.sign(
      { userId: 1, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({
      message: "Login successful ✅",
      token,
    });

    // Set token as HTTP-only cookie for middleware
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "error message" },
      { status: 500 }
    )
  }
}
 