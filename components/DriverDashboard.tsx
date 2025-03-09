
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

// ✅ Define the Ride type
interface Ride {
  id: string;
  pickup: string;
  destination: string;
  fare: number;
}

export default function DriverDashboard() {
  const [rides, setRides] = useState<Ride[]>([]); // ✅ Use Ride[] type
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await axios.get<Ride[]>("/api/rides/pending"); // ✅ Tell Axios the expected response type
      setRides(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptRide = async (rideId: string) => {
    setLoading(true);
    try {
      await axios.post("/api/rides/accept", { rideId, driverId: "driver-id-placeholder" });
      alert("Ride Accepted!");
      fetchRides();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
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
    </div>
  );
}
