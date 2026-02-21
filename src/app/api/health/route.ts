import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    await prisma.user.findMany();
    return Response.json({ status: "Database connected ✅" });
  } catch (error) {
    return Response.json({ status: "Database error ❌", error });
  }
}
