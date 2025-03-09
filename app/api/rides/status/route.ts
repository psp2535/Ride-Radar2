import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rideId = searchParams.get("rideId");

  if (!rideId) return NextResponse.json({ error: "Ride ID is required" }, { status: 400 });

  try {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { driver: true },
    });

    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

    return NextResponse.json(ride, { status: 200 });
  } catch (error) {
    console.error("Error fetching ride status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
