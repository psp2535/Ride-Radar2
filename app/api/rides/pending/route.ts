import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const pendingRides = await prisma.ride.findMany({
      where: { status: "pending" },
    });

    return NextResponse.json(pendingRides, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending rides:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
