import mongoose from "mongoose";
const { Schema } = mongoose;
const normalizeSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    metric: {
      type: String,
      default: "value",
    },

    amount: {
      type: Number,
      required: true,
    },

    timestamp: {
      type: Date,
      required: true,
    },

    hash: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);
const NormalizedEventt = mongoose.model("NormalizedEvent", normalizeSchema);
export default NormalizedEventt;
