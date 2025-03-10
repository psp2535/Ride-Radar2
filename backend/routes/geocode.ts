import express from "express";
import { Request, Response } from "express-serve-static-core";
import axios from "axios";

const router = express.Router();

// Fetch coordinates using OpenStreetMap Nominatim API
router.get("/geocode", async (req: Request, res: Response): Promise<void> => {
    try {
        const { place } = req.query;

        if (!place) {
            res.status(400).json({ error: "❌ Missing 'place' parameter." });
            return;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place as string)}`;
        
        const axiosResponse = await axios.get(url, {
            headers: { 'User-Agent': 'YourAppName/1.0 (your-email@example.com)' }
        });

        console.log("📍 Geocode API Response:", axiosResponse.data); // Debugging

        if (!axiosResponse.data || axiosResponse.data.length === 0) {
            res.status(404).json({ error: "❌ Location not found." });
            return;
        }

        const location = axiosResponse.data[0];
        res.json({ lat: location.lat, lon: location.lon });

    } catch (error) {
        console.error("❌ Error fetching geocode:", error);
        res.status(500).json({ error: "❌ Internal Server Error." });
    }
});


export default router;
