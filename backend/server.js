"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const directions_1 = __importDefault(require("./routes/directions"));
const geocode_1 = __importDefault(require("./routes/geocode"));
const fares_1 = __importDefault(require("./routes/fares"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.OPENROUTESERVICE_API_KEY;
// Middleware
app.use((0, cors_1.default)({ origin: "http://localhost:3000" }));
app.use(express_1.default.json());
app.use("/api/fares", fares_1.default);
// API Routes
app.use("/api", geocode_1.default);
app.use("/api", directions_1.default);
// Directions Endpoint
app.get("/api/directions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { start, end } = req.query;
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    try {
        const response = yield axios_1.default.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
            params: {
                api_key: API_KEY,
                start,
                end,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        console.error("❌ Error fetching route:", error);
        res.status(500).json({ error: "Failed to fetch directions" });
    }
}));
// HTTP Server & WebSocket Setup
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
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
