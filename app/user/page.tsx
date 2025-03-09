"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function UserDashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.id; // Get userId from session
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<{ id: string; status: string; driver?: { name: string; phone: string } | null } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch ride status automatically every 5 seconds if a ride is active
  useEffect(() => {
    if (rideId) {
      const interval = setInterval(fetchRideStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [rideId]);

  const fetchRideStatus = async () => {
    if (!rideId) return;
    try {
      const res = await axios.get(`/api/rides/status?rideId=${rideId}`);
      setRideStatus(res.data);
    } catch (error) {
      console.error("❌ Error fetching ride status:", error);
    }
  };

  const calculateFare = () => {
    const distance = Math.random() * 10 + 5;
    setFare(parseFloat((distance * 2.5).toFixed(2))); // Random fare calculation
  };

  const requestRide = async () => {
    if (!userId) {
      alert("❌ You must be logged in to request a ride.");
      return;
    }
    if (!pickup || !destination || fare === null) {
      alert("❌ Please fill in all fields and calculate fare before requesting.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/rides/request", {
        userId,
        pickup,
        destination,
        fare,
      });

      if (res.data?.id) {
        setRideId(res.data.id);
        alert("✅ Ride Requested Successfully!");
      } else {
        alert("❌ Failed to request ride. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error requesting ride:", error);
      alert("❌ Error requesting ride. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">User Dashboard</h2>

      <input
        type="text"
        placeholder="Enter Pickup Location"
        className="border p-2 w-full mt-2"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Destination"
        className="border p-2 w-full mt-2"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <button className="bg-blue-500 text-white p-2 w-full mt-2" onClick={calculateFare}>
        Calculate Fare
      </button>
      {fare !== null && <p className="mt-2">Estimated Fare: ${fare}</p>}

      <button className="bg-green-500 text-white p-2 w-full mt-2" onClick={requestRide} disabled={loading}>
        {loading ? "Requesting..." : "Request Ride"}
      </button>

      {rideStatus && (
        <div className="mt-4 p-4 border">
          <h3 className="font-bold">Ride Status</h3>
          <p>Status: {rideStatus.status}</p>
          {rideStatus.driver && (
            <>
              <p>Driver: {rideStatus.driver.name}</p>
              <p>Contact: {rideStatus.driver.phone}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
