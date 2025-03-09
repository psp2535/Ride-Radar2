import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Get the data from the request body
    const { userId, pickup, destination, fare } = await req.json();

    // Validate the input fields
    if (!userId || !pickup || !destination || !fare) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Find the user to make sure the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the ride request
    const ride = await prisma.ride.create({
      data: {
        userId,
        pickup,
        destination,
        fare,
        status: "pending",  // Ride status initially is "pending"
      },
    });

    // Return the ride information with a success status
    return NextResponse.json(ride, { status: 201 });
  } catch (error) {
    console.error("❌ Error requesting ride:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
