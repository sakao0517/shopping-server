import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import * as orderController from "../controller/order.js";
import wrapAsyncController from "../middleware/async-error.js";

const router = express.Router();
router.post(
  "/tmpOrder",
  isAuth,
  wrapAsyncController(orderController.uploadTmpOrder)
);
router.post(
  "/verifyOrder",
  isAuth,
  wrapAsyncController(orderController.verifyOrder)
);
router.post(
  "/successOrder",
  isAuth,
  wrapAsyncController(orderController.successOrder)
);

export default router;
