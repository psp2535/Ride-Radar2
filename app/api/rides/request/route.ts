import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, pickup, destination, fare, driverId } = await req.json();

    // Convert fare to a number if it's a string
    const parsedFare = typeof fare === 'number' ? fare : Number(fare);

    // Validate inputs
    if (!userId || !pickup || !destination || !driverId || isNaN(parsedFare) || parsedFare < 0) {
      return NextResponse.json({ error: "Invalid input fields" }, { status: 400 });
    }

    // Ensure user and driver exist
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const driver = await prisma.user.findUnique({ where: { id: driverId } });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

    // Create the ride
    const ride = await prisma.ride.create({
      data: {
        userId,
        driverId,
        pickup,
        destination,
        fare: parsedFare,  // Ensure fare is a valid number
        status: "pending",
      },
    });

    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("❌ Error requesting ride:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
