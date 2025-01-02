import express from "express";
import * as productController from "../controller/product.js";
import wrapAsyncController from "../middleware/async-error.js";

const router = express.Router();

router.get("/detail/:id", wrapAsyncController(productController.getProduct));
router.get(
  "/page/:category",
  wrapAsyncController(productController.getProductsByPage)
);
router.get("/search", wrapAsyncController(productController.getSearchProduct));

export default router;
