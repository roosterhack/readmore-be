import express from "express";
import authRoutes from "./routes/auth";
import subRoutes from "./routes/subs";
import articleRoutes from "./routes/article";
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
    app.use("/subs", subRoutes);
    app.use("/articles", articleRoutes);

    app.listen(8000, () => {
      console.log("Now listening");
    });
  })
  .catch((e) => {
    throw new Error(e);
  });
