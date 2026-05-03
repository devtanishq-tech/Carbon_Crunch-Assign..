import express from "express";
import Raw from "./models/rawScheam.js";
import NormalizedEvent from "./models/normalizeScheam.js";
import mongoose from "mongoose";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const Port = process.env.Port;
app.use(express.json());
app.use(cors());

// ================= DATABASE CONNECTION =================
const mongooseCreation = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log(`Mongo connection is successfully initiated`);
  } catch (err) {
    console.log(err.message);
  }
};
mongooseCreation();

// ======================= ENDPOINTS =======================

// ================= EVENT INGESTION =================
app.post("/api/events", async (req, res) => {
  let rawDataa;

  try {
    const data = req.body;
    rawDataa = await Raw.create({
      rawdata: data,
      status: "pending",
    });

    if (req.query.fail === "true") {
      throw new Error("Simulated failure triggered");
    }

    // ================= NORMALIZATION =================

    const payload = data.payload || data;

    const clientId = data.source || data.client || "unknown";

    const amount = Number(payload.amount);
    if (isNaN(amount)) throw new Error("Invalid Amount");

    const timestamp = new Date(payload.timestamp);
    if (isNaN(timestamp.getTime())) throw new Error("Invalid Date");

    const metric = payload.metric || "value";

    // ================= HASH GENERATION =================
    const hash = CryptoJS.SHA256(
      clientId + amount + timestamp.toISOString() + metric,
    ).toString();

    // ================= DEDUPLICATION =================
    const exist = await NormalizedEvent.findOne({ hash });

    if (exist) {
      await Raw.findByIdAndUpdate(rawDataa._id, {
        status: "processed",
      });
      return res.status(200).json({ message: "Duplicate event ignored" });
    }

    // ================= SAVE NORMALIZED DATA =================
    const correctData = await NormalizedEvent.create({
      clientId,
      amount,
      timestamp,
      metric,
      hash,
    });

    console.log(correctData);

    await Raw.findByIdAndUpdate(rawDataa._id, {
      status: "processed",
    });

    return res.status(201).json({
      message: "Event processed successfully",
    });
  } catch (err) {
    console.log(err.message);

    if (rawDataa) {
      await Raw.findByIdAndUpdate(rawDataa._id, {
        status: "failed",
        error: err.message,
      });
    }

    return res.status(500).json({ message: err.message });
  }
});

// ================= AGGREGATION =================
app.get("/api/aggregate", async (req, res) => {
  try {
    const { clientId, from, to } = req.query;

    let filter = {};

    if (clientId) {
      filter.clientId = clientId;
    }

    if (from || to) {
      filter.timestamp = {};

      if (from && !isNaN(new Date(from))) {
        filter.timestamp.$gte = new Date(from);
      }

      if (to && !isNaN(new Date(to))) {
        filter.timestamp.$lte = new Date(to);
      }
    }

    const result = await NormalizedEvent.aggregate([
      { $match: filter },

      {
        $addFields: {
          amount: { $toDouble: "$amount" },
        },
      },

      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json(result[0] || { totalAmount: 0, count: 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ================= RAW EVENTS =================
app.get("/api/events/raw", async (req, res) => {
  const rawDATA = await Raw.find();
  res.json(rawDATA);
});

// ================= PROCESSED EVENTS =================
app.get("/api/events/processed", async (req, res) => {
  const normalizeEvent = await NormalizedEvent.find();
  res.json(normalizeEvent);
});

// ================= FAILED EVENTS =================
app.get("/api/events/failed", async (req, res) => {
  const failedData = await Raw.find({ status: "failed" });
  res.json(failedData);
});

// ================= SERVER =================
app.listen(Port, () => {
  console.log(`Server is running on ${Port}`);
});
