import express from "express";
import * as productPageSettingController from "../controller/productPageSetting.js";
import wrapAsyncController from "../middleware/async-error.js";
const router = express.Router();

router.get(
  "/",
  wrapAsyncController(productPageSettingController.getProductPageSetting)
);
router.put(
  "/",
  wrapAsyncController(productPageSettingController.updateProductPageSetting)
);

export default router;
