import express, { Request, Response, Router } from "express";
import axios from "axios";

const router: Router = express.Router();

interface FareResponse {
    fares: {
        ola: string;
        uber: string;
        rapido: string;
    };
    distanceKm: number;
}

router.post("/", async (req: Request, res: Response): Promise<void> => {
    const { source, destination }: { source: string; destination: string } = req.body;

    if (!source || !destination) {
        res.status(400).json({ error: "Source and destination are required." });
        return;
    }

    // OpenStreetMap (OSRM) API to calculate distance
    const routeURL = `https://router.project-osrm.org/route/v1/driving/${source};${destination}?overview=false`;

    try {
        const response = await axios.get(routeURL);

        if (!response.data.routes || response.data.routes.length === 0) {
            res.status(500).json({ error: "Could not calculate route." });
            return;
        }

        const distanceKm = response.data.routes[0].distance / 1000; // Convert meters to kilometers

        // Approximate fare calculation
        const fares: FareResponse["fares"] = {
            ola: (distanceKm * 12).toFixed(2),    // ₹12 per km
            uber: (distanceKm * 14).toFixed(2),   // ₹14 per km
            rapido: (distanceKm * 10).toFixed(2)  // ₹10 per km
        };

        res.json({ fares, distanceKm });
    } catch (error) {
        console.error("❌ Error fetching route data:", error);
        res.status(500).json({ error: "Error fetching route data" });
    }
});

export default router;
