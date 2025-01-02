import express from "express";
import * as homeController from "../controller/home.js";
import wrapAsyncController from "../middleware/async-error.js";

const router = express.Router();

router.get("/", wrapAsyncController(homeController.getHomeWallpaer));
router.put("/", wrapAsyncController(homeController.updateWallpaper));

export default router;
