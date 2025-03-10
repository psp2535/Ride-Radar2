import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const driver = await prisma.user.findFirst({
      where: { role: "driver" }, // Ensure your database has drivers
    });

    if (!driver) {
      return NextResponse.json({ error: "No drivers available" }, { status: 404 });
    }

    return NextResponse.json({ driverId: driver.id }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching available driver:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
