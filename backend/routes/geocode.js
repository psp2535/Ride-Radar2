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
// Fetch coordinates using OpenStreetMap Nominatim API
router.get("/geocode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { place } = req.query;
        if (!place) {
            res.status(400).json({ error: "❌ Missing 'place' parameter." });
            return;
        }
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
        const axiosResponse = yield axios_1.default.get(url, {
            headers: { 'User-Agent': 'YourAppName/1.0 (your-email@example.com)' }
        });
        console.log("📍 Geocode API Response:", axiosResponse.data); // Debugging
        if (!axiosResponse.data || axiosResponse.data.length === 0) {
            res.status(404).json({ error: "❌ Location not found." });
            return;
        }
        const location = axiosResponse.data[0];
        res.json({ lat: location.lat, lon: location.lon });
    }
    catch (error) {
        console.error("❌ Error fetching geocode:", error);
        res.status(500).json({ error: "❌ Internal Server Error." });
    }
}));
exports.default = router;
