import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import * as adminController from "../controller/admin.js";
import { isAdmin } from "../middleware/isAdmin.js";
import wrapAsyncController from "../middleware/async-error.js";

const router = express.Router();

router.get(
  "/product/:category",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.getAdminProduct)
);
router.post("/product", isAuth, isAdmin, adminController.addAdminProduct);
router.put(
  "/product/updateDate",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.updateDateAdminProduct)
);
router.put(
  "/product/update",
  isAuth,
  isAdmin,
  adminController.updateAdminProduct
);
router.delete(
  "/product/:id",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.deleteAdminProduct)
);

//------------------------------//

router.get("/auth", isAuth, isAdmin, adminController.getAdminUser);
router.put(
  "/auth/update",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.updateAdminUser)
);
router.put(
  "/auth/order/update",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.updateAdminAuthOrder)
);
router.delete(
  "/auth/:id",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.deleteAdminAuth)
);

//------------------------------//

router.get(
  "/allOrder",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.getAdminAllOrder)
);
router.get(
  "/order",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.getAdminOrder)
);
router.delete(
  "/order/:id",
  isAuth,
  isAdmin,
  wrapAsyncController(adminController.deleteAdminOrder)
);

export default router;
