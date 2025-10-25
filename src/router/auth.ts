import express from "express";
import User from "../db/Auth.js";
import jwt from "jsonwebtoken"
import { userMiddleware } from "../middleware.js";
import Content from "../db/Content.js";
import Link from "../db/Link.js";
import { random } from "../utility.js";
import dotenv from "dotenv"
dotenv.config()
const router = express.Router();

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email: email, password: password});
    if(user){
        const token = jwt.sign({
            id: user._id
        }, process.env.jwt_password ?? "your_jwt_secret_key");
        res.status(200).json({
            message: "Login successful",
            token: token
        });
    }
    } catch (error) {
        res.status(500).json(error);
    }
    
});
router.post("/register", async(req, res) => {
 const {username,password,email}=req.body;
 try {
    const user=await User.create({
    username:username,
    password:password,
    email:email
 })
 if(user){
    res.status(200).json({
        message:"User registered successfully",
        user:user
    })
 }
 } catch (error) {
    res.status(500).json(error)
 }
 
});

router.post("/content",userMiddleware, async(req, res) => {
    const {link,type,title}=req.body;
    try {
         const content=await Content.create({
        link,
        type,
        title,
        userId:req.userId,
        tags:[]
    })
    if(content){
       res.status(200).json({content})
    }
    } catch (error) {
        res.status(500).json(error)
    }
   

})
router.get("/content",userMiddleware, async(req, res) => {
    const userId=req.userId;
    try {
        const contentall=await Content.find({userId:userId}).populate("userId","username email")
   res.json({contentall})
    } catch (error) {
        res.status(500).json(error)
    }
   
});

router.delete("/content",userMiddleware, async(req, res) => {
    const contentId=req.body.contentId;
    try {
        const deletes=await Content.deleteMany({
        _id:contentId,
        userId:req.userId
    })
    if (deletes) {
        res.status(200).json({ message: "Content deleted successfully" });
    }
    } catch (error) {
        res.status(500).json(error)
    }
    
});

router.post("/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body;

  try {
    if (share) {
      const existing = await Link.findOne({ userId: req.userId });
      if (existing) {
        return res.json({ hash: existing.hash });
      }

      const link = await Link.create({
        userId: req.userId,
        hash: random(10),
      });

      return res.json({ hash: link.hash });
    } else {
      await Link.deleteOne({ userId: req.userId });
      return res.json({ message: "Sharing disabled" });
    }
  } catch (error) {
    console.error("Error in /brain/share:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/brain/:sharelink", async (req, res) => {
  try {
    const hash = req.params.sharelink;
    console.log("hash",hash)

    const link = await Link.findOne({ hash });
    console.log("link",link)
    if (!link) {
      return res.status(404).json({ message: "Invalid share link" });
    }

    const user = await User.findById(link.userId).select("username");
    console.log("user",user)
    const content = await Content.find({ userId: link.userId });
    console.log("content",content)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      username: user.username,
      content,
    });
  } catch (error) {
    console.error("Error fetching shared brain:", error);
    res.status(500).json({ error: "Server error" });
  }
});
export default router;