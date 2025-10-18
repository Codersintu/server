import mongoose, { Types } from "mongoose";

const memorySchema = new mongoose.Schema({
  userId:  { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: false },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;