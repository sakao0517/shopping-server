import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { connectMongo } from "./database/database.js";
import authRouter from "./router/auth.js";
import productRouter from "./router/product.js";
import orderRouter from "./router/order.js";
import adminRouter from "./router/admin.js";
import homeRouter from "./router/home.js";
import categoryRouter from "./router/category.js";
import productPageSettingRouter from "./router/productPageSetting.js";

const app = express();
const corsOption = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOption));
app.use(cookieParser());
app.use(morgan("tiny"));
app.use(helmet());

app.use("/category", categoryRouter);
app.use("/home", homeRouter);
app.use("/productPageSetting", productPageSettingRouter);
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
  res.sendStatus(404);
});
app.use((error, req, res, next) => {
  console.log(error);
  res.sendStatus(500);
});

connectMongo().then(() => {
  app.listen(8080);
  console.log("---server start---");
});
