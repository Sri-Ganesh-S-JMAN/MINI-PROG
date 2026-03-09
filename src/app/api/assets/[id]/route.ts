import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
 
    const asset = await prisma.asset.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        allocations: true,
      },
    });
 
    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: 404 }
      );
    }
 
    return NextResponse.json(asset);
 
  } catch (error) {
    console.error("FETCH SINGLE ASSET ERROR:", error);
 
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
 
    const { status } = body;
 
    const updatedAsset = await prisma.asset.update({
      where: {
        id: Number(id),
      },
      data: {
        status: status,
      },
    });
 
    return NextResponse.json(updatedAsset);
 
  } catch (error) {
    console.error("UPDATE ASSET ERROR:", error);
 
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}
