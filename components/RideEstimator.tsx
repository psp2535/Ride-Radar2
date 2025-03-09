"use client";
import { useState } from "react";
import axios from "axios";

export default function RideEstimator() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateFare = () => {
    const distance = Math.random() * 10 + 5; // Simulated distance
    setFare(distance * 2.5); // $2.5 per km
  };

  const requestRide = async () => {
    setLoading(true);
    try {
      await axios.post("/api/rides/request", { userId: "user-id-placeholder", pickup, destination, fare });
      alert("Ride Requested!");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">Ride Estimator</h2>
      <input type="text" placeholder="Enter Pickup Location" className="border p-2 w-full mt-2" value={pickup} onChange={(e) => setPickup(e.target.value)} />
      <input type="text" placeholder="Enter Destination" className="border p-2 w-full mt-2" value={destination} onChange={(e) => setDestination(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 w-full mt-2" onClick={calculateFare}>Calculate Fare</button>
      {fare !== null && <p className="mt-2">Estimated Fare: ${fare.toFixed(2)}</p>}
      <button className="bg-green-500 text-white p-2 w-full mt-2" onClick={requestRide} disabled={loading}>{loading ? "Requesting..." : "Request Ride"}</button>
    </div>
  );
}