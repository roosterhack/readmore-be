import express from "express";
import authRoutes from "./routes/auth";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");

    const app = express();

    app.get("/", (req, res) => {
      res.send("hello");
    });

    app.use(express.json());
    app.use(cors());
    app.use("/auth", authRoutes);

    app.listen(8000, () => {
      console.log("Now listening");
    });
  })
  .catch((e) => {
    throw new Error(e);
  });
