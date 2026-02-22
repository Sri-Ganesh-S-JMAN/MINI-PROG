import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { message: "Unauthorized ❌ No token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as any;

    // 🔥 ROLE CHECK
    if (decoded.role !== "Admin") {
      return Response.json(
        { message: "Access denied ❌ Admin only" },
        { status: 403 }
      );
    }

    return Response.json({
      message: "Welcome Admin 👑",
      user: decoded,
    });

  } catch (error: any) {
    return Response.json(
      { message: "Invalid token ❌" },
      { status: 401 }
    );
  }
}