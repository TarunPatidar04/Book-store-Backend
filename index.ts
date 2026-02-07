import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db";
import authRouter from "./src/routes/authRouter";
import productRouter from "./src/routes/productRouter";
import cartRouter from "./src/routes/cartRouter";
import wishListRouter from "./src/routes/wishListRouter";
import addressRouter from "./src/routes/addressRouter";
import userRouter from "./src/routes/userRouter";
import orderRouter from "./src/routes/orderRouter";
import passport from "./src/controllers/strategy/googleStrategy";

const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
};

connectDB();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());

const PORT = process.env.PORT || 8000;

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishListRouter);
app.use("/api/user/address", addressRouter);
app.use("/api/user", userRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
