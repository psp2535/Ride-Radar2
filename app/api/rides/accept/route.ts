import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { rideId, driverId } = await req.json();

    console.log("🚕 Accepting Ride Request:", { rideId, driverId });

    if (!rideId || !driverId) {
      console.log("❌ Missing rideId or driverId");
      return NextResponse.json({ error: "Ride ID and Driver ID are required" }, { status: 400 });
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });

    if (!ride) {
      console.log("❌ Ride Not Found:", rideId);
      return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    }

    if (ride.status !== "pending") {
      console.log("⚠️ Ride Already Accepted or Completed:", ride.status);
      return NextResponse.json({ error: "Ride is not available for acceptance" }, { status: 400 });
    }

    // Check if the driver exists
    const driver = await prisma.user.findUnique({ where: { id: driverId } });

    console.log("🔍 Driver Lookup Result:", driver); // Debug log

    if (!driver) {
      console.log("❌ Driver Not Found:", driverId);
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    if (driver.role !== "driver") {
      console.log("🚫 Unauthorized User (Not a Driver):", driver.role);
      return NextResponse.json({ error: "User is not authorized as a driver" }, { status: 403 });
    }

    // Assign driver and update ride status
    const updatedRide = await prisma.ride.update({
      where: { id: rideId },
      data: { driverId: driver.id, status: "accepted" },
    });

    console.log("✅ Ride Accepted Successfully:", updatedRide);

    return NextResponse.json(updatedRide, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error accepting ride:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
