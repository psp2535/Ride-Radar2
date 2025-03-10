import express from "express";
import { Request, Response } from "express-serve-static-core";
import fetch from "node-fetch";

const router = express.Router();

router.get("/directions", async (req: Request, res: Response): Promise<void> => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }

        // Use OSRM API (Ensure you have OSRM running)
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
        const response = await fetch(osrmUrl);
        const data: { routes: any[] } = await response.json() as { routes: any[] };

        if (!data.routes || data.routes.length === 0) {
            res.status(404).json({ error: "No route found" });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching directions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
