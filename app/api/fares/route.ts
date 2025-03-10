import { NextRequest, NextResponse } from "next/server";

// Sample fare rates (adjust as needed)
const BASE_FARE = 50; // Base fare
const PER_KM_RATE = {
  ola: 10,
  uber: 12,
  rapido: 8,
};

// Function to calculate distance (mocked for now)
const calculateDistance = (source: string, destination: string) => {
  // TODO: Replace this with actual distance calculation logic (Google Maps API, OpenRoute, etc.)
  return Math.random() * 15 + 5; // Simulating distance between 5-20 km
};

export async function POST(req: NextRequest) {
  try {
    const { source, destination } = await req.json();

    if (!source || !destination) {
      return NextResponse.json({ error: "Source and destination required" }, { status: 400 });
    }

    const distance = calculateDistance(source, destination);
    const fares = {
      ola: BASE_FARE + distance * PER_KM_RATE.ola,
      uber: BASE_FARE + distance * PER_KM_RATE.uber,
      rapido: BASE_FARE + distance * PER_KM_RATE.rapido,
    };

    return NextResponse.json({ fares, distance });
  } catch (error) {
    console.error("❌ Error calculating fares:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
