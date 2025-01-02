import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import * as authController from "../controller/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import wrapAsyncController from "../middleware/async-error.js";

const router = express.Router();

const validateEmail = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("이메일을 입력해주세요.")
    .isEmail()
    .withMessage("이메일 양식에 맞게 입력하세요"),
  validate,
];

const validatePassword = [
  body("password")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("비밀번호를 입력해주세요.(6자 이상 20자 이하)"),
  validate,
];

const validateCredential = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("이메일을 입력해주세요.")
    .isEmail()
    .withMessage("이메일 양식에 맞게 입력해주세요."),
  body("password")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("비밀번호를 입력해주세요.(6자 이상 20자 이하)"),
  validate,
];

const validateSignup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("이름을 입력해주세요.")
    .isLength({ min: 2, max: 20 })
    .withMessage("이름을 입력해주세요.(2자 이상 20자 이하)"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("전화번호를 입력해주세요.")
    .isLength({ min: 11, max: 11 })
    .withMessage("전화번호 양식에 맞게 입력해주세요."),
  ...validateCredential,
];

const validateUpdateProfile = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("전화번호를 입력해주세요.")
    .isLength({ min: 11, max: 11 })
    .withMessage("전화번호 양식에 맞게 입력해주세요."),
  body("password")
    .isLength({ min: 6, max: 20 })
    .withMessage("비밀번호를 입력해주세요.(6자 이상 20자 이하)")
    .optional({ nullable: true, checkFalsy: true }),
  body("checkPassword")
    .isLength({ min: 6, max: 20 })
    .withMessage("비밀번호 확인을 입력해주세요.(6자 이상 20자 이하)")
    .optional({ nullable: true, checkFalsy: true }),
  validate,
];

router.post("/login", wrapAsyncController(authController.login));
router.get("/me", isAuth, wrapAsyncController(authController.me));
router.post(
  "/signup",
  validateSignup,
  wrapAsyncController(authController.signup)
);
router.delete(
  "/delete/",
  isAuth,
  wrapAsyncController(authController.deleteUser)
);

//------------------------------//

router.get("/info", isAuth, wrapAsyncController(authController.getUserInfo));
router.put(
  "/updateProfile",
  isAuth,
  validateUpdateProfile,
  wrapAsyncController(authController.updateProfile)
);

//------------------------------//

router.post(
  "/addToCart",
  isAuth,
  wrapAsyncController(authController.addToCart)
);
router.get(
  "/getCartProducts",
  isAuth,
  wrapAsyncController(authController.getUserCartProducts)
);
router.put(
  "/updateCart",
  isAuth,
  wrapAsyncController(authController.updateUserCart)
);
router.put(
  "/deleteCart",
  isAuth,
  wrapAsyncController(authController.deleteUserCart)
);

//------------------------------//

router.post(
  "/forgotPassword",
  validateEmail,
  wrapAsyncController(authController.forgotPassword)
);
router.post(
  "/resetPassword",
  validatePassword,
  wrapAsyncController(authController.resetPassword)
);

export default router;
