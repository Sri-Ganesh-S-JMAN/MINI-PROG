import { NextResponse } from "next/server"
import { Pool } from "pg"
import jwt from "jsonwebtoken"
 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
 
export async function POST(req: Request) {
 
  try {
 
    const { email, password } = await req.json()
 
    // find user in database
    const result = await pool.query(
      'SELECT * FROM "User" WHERE "email"=$1',
      [email]
    )
 
    // if user not found
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
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
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    )
 
    return NextResponse.json({
      token,
      role: user.role
    })
 
  } catch (error) {
 
    console.error(error)
 
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}
 