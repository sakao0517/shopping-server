import express from "express";
import * as categoryController from "../controller/category.js";
import wrapAsyncController from "../middleware/async-error.js";
const router = express.Router();

router.get("/", wrapAsyncController(categoryController.getCategory));
router.put("/", wrapAsyncController(categoryController.updateCategory));

export default router;
