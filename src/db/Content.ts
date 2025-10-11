import mongoose, { Types } from "mongoose";

const contentSchema = new mongoose.Schema({
  link: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: 'Tag' }],
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  
},{timestamps:true});

const Content = mongoose.model('Content', contentSchema);
export default Content;
