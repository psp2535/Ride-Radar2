"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import io from "socket.io-client";

const socket = io("http://localhost:4000", { transports: ["websocket"] });

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapPanner({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [fares, setFares] = useState<{ ola: number; uber: number; rapido: number } | null>(null);
  const [rideId, setRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<{ id: string; status: string; driver?: { name: string; phone: string } | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState([]);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

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

  const fetchCoordinates = async (place: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/geocode?place=${encodeURIComponent(place)}`);
      const data = await res.json();
      return data?.lat !== undefined && data?.lon !== undefined ? [data.lat, data.lon] as [number, number] : null;
    } catch (error) {
      console.error("❌ Error fetching coordinates:", error);
      return null;
    }
  };

  const fetchDirections = async (start: [number, number], end: [number, number]) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/directions?start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
      );
      const data = await res.json();
      setRoute(data.routes[0]?.geometry?.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]) || []);
    } catch (error) {
      console.error("❌ Error fetching directions:", error);
    }
  };

  const fetchFares = async () => {
    if (!sourceCoords || !destinationCoords) return;
    try {
      const response = await fetch("http://localhost:3000/api/fares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceCoords.join(","), destination: destinationCoords.join(",") }),
      });
      if (!response.ok) throw new Error("❌ Failed to fetch fares");
      const data = await response.json();
      setFares(data.fares);
    } catch (error) {
      console.error("❌ Error fetching fares:", error);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSourceCoords([latitude, longitude]);
        setPickup("Current Location");
      },
      (error) => {
        console.error("❌ Error fetching location:", error);
        alert("❌ Unable to access location.");
      }
    );
  };

  const requestRide = async () => {
    setRideStatus({ id: rideId || "", status: "Fetching location..." });

    let srcCoords = useCurrentLocation ? sourceCoords : await fetchCoordinates(pickup);
    let destCoords = await fetchCoordinates(destination);

    if (!srcCoords || !destCoords) {
        setRideStatus({ id: rideId || "", status: "❌ Invalid locations. Please enter correct addresses." });
        return;
    }

    setSourceCoords(srcCoords as [number, number]);
    setDestinationCoords(destCoords);
    setRideStatus({ id: rideId || "", status: "Fetching route..." });
    fetchDirections(srcCoords, destCoords);

    // 🟢 Fetch available driver
    const driverResponse = await fetch("/api/drivers/available");
    const driverData = await driverResponse.json();

    if (!driverResponse.ok || !driverData?.driverId) {
        setRideStatus({ id: rideId || "", status: "❌ No drivers available." });
        return;
    }

    // 🟢 Fetch fare estimate
    const fareResponse = await fetch("http://localhost:3000/api/fares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: srcCoords.join(","), destination: destCoords.join(",") }),
    });
    const fareData = await fareResponse.json();
    const calculatedFare = fareData.fares?.ola || 0; // Default to 0 if no fare

    // Prepare request payload
    const rideRequest = {
      userId,
      pickup,
      destination,
      fare: calculatedFare ?? 0, // Default to 0 if undefined
      driverId: driverData.driverId,
  };
  
  // if (!rideRequest.userId || !rideRequest.pickup || !rideRequest.destination || rideRequest.fare <= 0 || !rideRequest.driverId) {
  //     console.log("❌ Invalid Ride Request:", rideRequest);
  //     setRideStatus({ id: rideId || "", status: "❌ Missing required ride details." });
  //     return;
  // }

    try {
        setRideStatus({ id: rideId || "", status: "Requesting ride..." });

        const response = await fetch("/api/rides/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rideRequest),
        });

        const result = await response.json();

        if (response.ok) {
            setRideStatus({ id: rideId || "", status: "✅ Ride requested successfully!" });
        } else {
            setRideStatus({ id: rideId || "", status: `❌ Error: ${result.error || "Failed to request ride"}` });
        }
    } catch (error) {
        setRideStatus({ id: rideId || "", status: "❌ Server error. Try again later." });
        console.error("Error requesting ride:", error);
    }
};


  const logout = () => {
    signOut();
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold">User Dashboard</h2>

      <input
        type="text"
        placeholder="Pickup Location"
        className="border p-2 w-full mt-2"
        value={pickup}
        onChange={(e) => { setUseCurrentLocation(false); setPickup(e.target.value); }}
        disabled={useCurrentLocation}
      />
      <label className="flex items-center mt-2">
        <input
          type="checkbox"
          checked={useCurrentLocation}
          onChange={(e) => { setUseCurrentLocation(e.target.checked); if (e.target.checked) getCurrentLocation(); }}
          className="mr-2"
        />
        Use Current Location
      </label>
      <input
        type="text"
        placeholder="Destination"
        className="border p-2 w-full mt-2"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 w-full mt-2"
        onClick={fetchFares}
        disabled={loading}
      >
        {loading ? "Fetching Fares..." : "Compare Fares"}
      </button>

      {fares && (
        <div className="p-4 border mt-4 rounded">
          <h2 className="text-xl font-bold">Fare Estimates</h2>
          <p>Ola: ₹{fares.ola}</p>
          <p>Uber: ₹{fares.uber}</p>
          <p>Rapido: ₹{fares.rapido}</p>
        </div>
      )}

      <button
        className="bg-green-500 text-white p-2 w-full mt-2"
        onClick={requestRide}
        disabled={loading}
      >
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

      <button
        className="bg-red-500 text-white p-2 w-full mt-2"
        onClick={logout}
      >
        Logout
      </button>

      <MapContainer center={sourceCoords || [20.5937, 78.9629]} zoom={13} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapPanner coords={sourceCoords} />
        {sourceCoords && <Marker position={sourceCoords} icon={customIcon} />}
        {destinationCoords && <Marker position={destinationCoords} icon={customIcon} />}
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// // 🚀 Real-time Socket Connection (Ensure backend supports this)
// import io from "socket.io-client";
// const socket = io("http://localhost:4000", { transports: ["websocket"] });

// const customIcon = new L.Icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// // 📍 Move Map When Location Changes
// function MapPanner({ coords }: { coords: [number, number] | null }) {
//   const map = useMap();
//   useEffect(() => {
//     if (coords) {
//       map.setView(coords, 13);
//     }
//   }, [coords, map]);
//   return null;
// }

// export default function UserDashboard() {
//   const { data: session } = useSession();
//   const userId = session?.user?.id;

//   const [pickup, setPickup] = useState("");
//   const [destination, setDestination] = useState("");
//   const [fare, setFare] = useState<number | null>(null);
//   const [rideId, setRideId] = useState<string | null>(null);
//   const [rideStatus, setRideStatus] = useState<{ status: string; driver?: { name: string; phone: string; location?: { lat: number; lon: number } } } | null>(null);
//   const [loading, setLoading] = useState(false);

//   const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
//   const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
//   const [route, setRoute] = useState<[number, number][]>([]);

//   // 🔹 Get User's Current Location on Page Load
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setSourceCoords([position.coords.latitude, position.coords.longitude]);
//       },
//       (error) => console.error("❌ Error fetching location:", error),
//       { enableHighAccuracy: true }
//     );
//   }, []);

//   // 🔹 Poll Ride Status Every 5 Seconds
//   useEffect(() => {
//     if (rideId) {
//       const interval = setInterval(fetchRideStatus, 5000);
//       return () => clearInterval(interval);
//     }
//   }, [rideId]);

//   const fetchRideStatus = async () => {
//     if (!rideId) return;
//     try {
//       const res = await axios.get(`/api/rides/status?rideId=${rideId}`);
//       setRideStatus(res.data);

//       // 🔹 Update driver’s real-time location
//       if (res.data?.driver?.location) {
//         setSourceCoords([res.data.driver.location.lat, res.data.driver.location.lon]);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching ride status:", error);
//     }
//   };

//   const fetchCoordinates = async (place: string) => {
//     try {
//       const res = await fetch(`http://localhost:4000/api/geocode?place=${encodeURIComponent(place)}`);
//       const data = await res.json();
//       return data?.lat !== undefined && data?.lon !== undefined ? [data.lat, data.lon] as [number, number] : null;
//     } catch (error) {
//       console.error("❌ Error fetching coordinates:", error);
//       return null;
//     }
//   };

//   const fetchDirections = async (start: [number, number], end: [number, number]) => {
//     try {
//       const res = await fetch(
//         `http://localhost:4000/api/directions?start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`
//       );
//       const data = await res.json();

//       const formattedRoute = data.routes?.[0]?.geometry?.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
//       setRoute(formattedRoute || []);
//     } catch (error) {
//       console.error("❌ Error fetching directions:", error);
//     }
//   };

//   const requestRide = async () => {
//     if (!userId) {
//       alert("❌ You must be logged in to request a ride.");
//       return;
//     }
//     if (!pickup || !destination) {
//       alert("❌ Please enter both pickup and destination.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const srcCoords = await fetchCoordinates(pickup);
//       const destCoords = await fetchCoordinates(destination);

//       if (!srcCoords || !destCoords) {
//         alert("Invalid locations. Try again.");
//         return;
//       }

//       setSourceCoords(srcCoords);
//       setDestinationCoords(destCoords);
//       await fetchDirections(srcCoords, destCoords);

//       const res = await axios.post("/api/rides/request", {
//         userId,
//         pickup,
//         destination,
//         fare,
//       });

//       if (res.data?.id) {
//         setRideId(res.data.id);
//         alert("✅ Ride Requested Successfully!");
//       } else {
//         alert("❌ Failed to request ride.");
//       }
//     } catch (error) {
//       console.error("❌ Error in requestRide:", error);
//       alert("Error requesting ride.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
//       <h2 className="text-xl font-bold">User Dashboard</h2>

//       <input type="text" placeholder="Pickup" className="border p-2 w-full mt-2" value={pickup} onChange={(e) => setPickup(e.target.value)} />
//       <input type="text" placeholder="Destination" className="border p-2 w-full mt-2" value={destination} onChange={(e) => setDestination(e.target.value)} />

//       <button className="bg-green-500 text-white p-2 w-full mt-2" onClick={requestRide} disabled={loading}>
//         {loading ? "Requesting..." : "Request Ride"}
//       </button>

//       {rideStatus && (
//         <div className="mt-4 p-4 border">
//           <h3 className="font-bold">Ride Status</h3>
//           <p>Status: {rideStatus?.status || "Unknown"}</p>
//           {rideStatus?.driver && (
//             <>
//               <p>Driver: {rideStatus.driver.name}</p>
//               <p>Contact: {rideStatus.driver.phone}</p>
//             </>
//           )}
//         </div>
//       )}

//       {/* 📍 Map Section */}
//       <MapContainer center={sourceCoords || [20.5937, 78.9629]} zoom={13} style={{ height: "400px", width: "100%" }}>
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         <MapPanner coords={sourceCoords} />
//         {sourceCoords && <Marker position={sourceCoords} icon={customIcon} />}
//         {destinationCoords && <Marker position={destinationCoords} icon={customIcon} />}
//         {route.length > 0 && <Polyline positions={route} color="blue" />}
//       </MapContainer>
//     </div>
//   );
// }
