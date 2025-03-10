import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createServer } from "http";
import { Server } from "socket.io";
import directionsRoutes from "./routes/directions";
import geocodeRoutes from "./routes/geocode";
import faresRoute from "./routes/fares";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.OPENROUTESERVICE_API_KEY;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/fares", faresRoute);
// API Routes
app.use("/api", geocodeRoutes);
app.use("/api", directionsRoutes);

// Directions Endpoint
app.get("/api/directions", async (req, res) => {
    const { start, end } = req.query;

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

    try {
        const response = await axios.get(
            `https://api.openrouteservice.org/v2/directions/driving-car`,
            {
                params: {
                    api_key: API_KEY,
                    start,
                    end,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching route:", error);
        res.status(500).json({ error: "Failed to fetch directions" });
    }
});

// HTTP Server & WebSocket Setup
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
});

// WebSocket Events
io.on("connection", (socket) => {
    console.log("🚀 New WebSocket Connection:", socket.id);

    socket.on("rideRequest", (data) => {
        console.log("📍 Ride Request Received:", data);
        socket.emit("rideUpdate", { status: "Ride Confirmed" });
    });

    socket.on("disconnect", () => {
        console.log("❌ WebSocket Disconnected:", socket.id);
    });
});

// Start Server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
