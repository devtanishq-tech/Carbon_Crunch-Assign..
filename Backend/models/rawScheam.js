import mongoose from "mongoose";
const { Schema } = mongoose;
const rawSchema = new Schema(
  {
    rawdata: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },
    error: {
      type: String,
      default: null,
    },

    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);
const Raw = mongoose.model("Raw", rawSchema);
export default Raw;
