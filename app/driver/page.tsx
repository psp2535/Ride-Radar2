"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define the Ride type
type Ride = {
  id: string;
  pickup: string;
  destination: string;
  fare: number;
};

export default function DriverDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRides();
    fetchDriverId(); // Get logged-in driver ID
  }, []);

  const fetchRides = async () => {
    try {
      const res = await axios.get("/api/rides/pending");
      setRides(res.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  const fetchDriverId = async () => {
    try {
      const res = await axios.get("/api/auth/session"); // Ensure correct auth endpoint
      console.log("🔍 Session Response:", res.data); // Debugging log

      if (res.data?.user?.id) {
        console.log("✅ Driver ID Retrieved:", res.data.user.id);
        setDriverId(res.data.user.id);
      } else {
        console.warn("⚠️ Driver ID not found in session");
      }
    } catch (error) {
      console.error("❌ Error fetching driver ID:", error);
    }
  };

  const acceptRide = async (rideId: string) => {
    if (!driverId) {
      console.warn("⚠️ Driver ID missing, fetching again...");
      await fetchDriverId(); // Ensure driverId is retrieved before proceeding
    }

    if (!driverId) {
      // Double check after fetching
      alert("Error: Driver not logged in!");
      return;
    }

    console.log("🚕 Sending Accept Ride Request:", { rideId, driverId });

    setLoading(true);
    try {
      const res = await axios.post("/api/rides/accept", { rideId, driverId });

      console.log("✅ Ride Accepted:", res.data);

      alert("Ride Accepted!");
      fetchRides(); // Refresh ride list
    } catch (error) {
      console.error("❌ Error accepting ride:", error);
      alert("Failed to accept ride.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }); // Redirects to the login page on the same host
  };
  
  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">Driver Dashboard</h2>
      {rides.length === 0 ? (
        <p>No pending rides</p>
      ) : (
        rides.map((ride) => (
          <div key={ride.id} className="border p-2 mt-2">
            <p>Pickup: {ride.pickup}</p>
            <p>Destination: {ride.destination}</p>
            <p>Fare: ${ride.fare}</p>
            <button
              className="bg-blue-500 text-white p-2 w-full mt-2"
              onClick={() => acceptRide(ride.id)}
              disabled={loading}
            >
              {loading ? "Accepting..." : "Accept Ride"}
            </button>
          </div>
        ))
      )}

      {/* Logout Button */}
      <button
        className="bg-red-500 text-white p-2 w-full mt-4 rounded font-bold hover:bg-red-600 transition"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
