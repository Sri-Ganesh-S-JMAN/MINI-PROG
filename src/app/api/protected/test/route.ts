import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    console.log("==== DEBUG START ====");
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("NO HEADER");
      return Response.json(
        { message: "Unauthorized ❌ No token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    console.log("DECODED:", decoded);
    console.log("==== DEBUG END ====");

    return Response.json({
      message: "You accessed protected route ✅",
      user: decoded,
    });

  } catch (error: any) {
    console.log("VERIFY ERROR:", error.message);

    return Response.json(
      { message: "Invalid token ❌", error: error.message },
      { status: 401 }
    );
  }
}