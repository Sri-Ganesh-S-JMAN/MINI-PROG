import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const requestId = Number(id);

  if (isNaN(requestId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const request = await prisma.assetRequest.findUnique({
    where: { id: requestId },
    include: {
      user: true,
      asset: true,
      approvals: true,
    },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(request);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const requestId = Number(id);

  await prisma.approval.deleteMany({
    where: { requestId },
  });

  const deleted = await prisma.assetRequest.delete({
    where: { id: requestId },
  });

  return NextResponse.json(deleted);
}