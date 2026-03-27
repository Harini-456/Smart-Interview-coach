import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

router.post('/signup', async(req, res) => {
    console.log("Request body:", req.body);

    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

  if (!email || !password) {
        return res.json({"message":"invalid request fields"})
    }
  else if(password.length <= 6){
     return res.json({"message":"invalid request password"})
  }

  
    const usercheck = await User.findOne({email:email})
    console.log("userCheck: ",usercheck)
        if(usercheck){
            return res.json({"mesage":"email already exists"})
        }

  const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
        name: name,
        email: email,
        password: hashPassword,
    })
    await user.save()
    return res.json({"message":"success"})
}) 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found" });

     /*// Allow ONLY ACTIVE users
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Your account is not active. Contact admin."
      });
    } */

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_CODE,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
