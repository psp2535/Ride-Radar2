"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
let rideRequests = [];
router.post("/request", (req, res) => {
    const { userId, source, destination, service } = req.body;
    const rideId = Math.random().toString(36).substr(2, 9);
    const ride = { rideId, userId, source, destination, service, status: "pending" };
    rideRequests.push(ride);
    res.json({ ride });
});
router.post("/update", (req, res) => {
    const { rideId, driverId, status } = req.body;
    const ride = rideRequests.find(r => r.rideId === rideId);
    if (ride) {
        ride.status = status;
        ride.driverId = driverId;
        res.json({ ride });
    }
    else {
        res.status(404).json({ error: "Ride not found" });
    }
});
exports.default = router;
