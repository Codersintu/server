import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import authRouter from "./router/auth.js"
import dotenv from "dotenv"
dotenv.config()
const app = express()
app.use(cors({
    origin:['https://second-brain-j5vd.vercel.app'],
    methods:'GET,PUT,POST,DELETE',
    credentials:true
}))
app.use(express.json())
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL ?? "mongodb+srv://codewithbihari:codebihari9199@cluster0.vrkl8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  } catch (error) {
    return error;
  }
}
main()


app.use("/api/v1", authRouter)
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});

