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
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { source, destination } = req.body;
    if (!source || !destination) {
        res.status(400).json({ error: "Source and destination are required." });
        return;
    }
    // OpenStreetMap (OSRM) API to calculate distance
    const routeURL = `https://router.project-osrm.org/route/v1/driving/${source};${destination}?overview=false`;
    try {
        const response = yield axios_1.default.get(routeURL);
        if (!response.data.routes || response.data.routes.length === 0) {
            res.status(500).json({ error: "Could not calculate route." });
            return;
        }
        const distanceKm = response.data.routes[0].distance / 1000; // Convert meters to kilometers
        // Approximate fare calculation
        const fares = {
            ola: (distanceKm * 12).toFixed(2), // ₹12 per km
            uber: (distanceKm * 14).toFixed(2), // ₹14 per km
            rapido: (distanceKm * 10).toFixed(2) // ₹10 per km
        };
        res.json({ fares, distanceKm });
    }
    catch (error) {
        console.error("❌ Error fetching route data:", error);
        res.status(500).json({ error: "Error fetching route data" });
    }
}));
exports.default = router;
