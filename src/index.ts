import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import authRouter from "./router/auth.js"
import multer from "multer"
import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";
import ImageKit from "imagekit"
import Memory from "./db/file.js"
import { userMiddleware } from "./middleware.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const port = process.env.PORT || ""
const app = express()
app.use(express.json())

app.use(cors({
    origin:['http://localhost:5173'],
    methods:'GET,PUT,POST,DELETE',
    credentials:true
}))
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL || "");
  } catch (error) {
    return error;
  }
}
main()
const uploadFolder=path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder);
}
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })
const imagekit = new ImageKit({
  publicKey: "public_jxgZI9oGFUcRIhDIujdi0Crt+9A=",
  privateKey: "private_Mt2sQUHZRwCf2mOSXx96H7aZZAQ=",
  urlEndpoint: "https://ik.imagekit.io/j3whydwtk",
});

app.post('/upload',userMiddleware, upload.single('file'), async(req, res) => {
   if (!req.file) return res.status(400).send("No file uploaded.");
   try {
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/Brainly", 
    });
    console.log(result);

    const memory = new Memory({
      userId: req.userId,
      title: req.body.title || "",
      imageUrl: result.url,
    });
    await memory.save();
  res.json({ message: "File uploaded successfully!",memory });
   } catch (error) {
    console.log("error is error",error);
    res.status(500).send("Error uploading file.");
   }
});

app.get('/my-memories',userMiddleware, async(req, res) => {
  try {
    const memories = await Memory.find({ userId: req.userId });
    res.json({memories});
  } catch (error) {
    res.status(500).send("Error fetching memories.");
  }
});

app.delete("/delete",userMiddleware,async(req,res)=>{
  const userId = req.userId;
    const  docsId = req.body.docsId;
     try {
      await Memory.deleteMany({ _id: docsId, userId })
      return res.status(200).json("Document deleted!")
     } catch (error) {
      return res.json('Error in deleting')
     }
})



app.use("/api/v1", authRouter)
app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
