import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(){
  try{
    const assets = await prisma.asset.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(assets);
  }
  catch(error){
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request){
  try{
    const body = await request.json();
    const { name, serialNo } = body;

    if(!name || !serialNo) {
      return NextResponse.json(
        { error: "Name and Serial Number are required" },
        { status: 400 }
      );
    }

    const newAsset = await prisma.asset.create({
      data: {
        name,
        serialNo,
      },
    });
    return NextResponse.json(newAsset, { status: 201 });
  }
  catch(error){
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
