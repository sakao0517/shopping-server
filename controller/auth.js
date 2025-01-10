import * as authRepository from "../data/auth.js";
import * as productRepository from "../data/product.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "./mail.js";
import dayjs from "dayjs";

dayjs.locale("ko");
dotenv.config();

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await authRepository.getUserByEmail(email);
  if (!user) return res.status(401).json({ message: "login error" });
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "login error" });
  }
  const token = await createJwtToken(user.id);
  res.setHeader("token", token);
  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cart: user.cart,
    isAdmin: user.isAdmin,
    address1: user.address1,
    address2: user.address2,
    zipcode: user.zipcode,
    createdAt: user.createdAt,
    orders: user.orders,
  });
}

export async function me(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(404).json({ message: "get me error" });
  const token = await createJwtToken(user.id);
  res.setHeader("token", token);
  res.status(200).json({
    id: user.id,
  });
}

export async function signup(req, res) {
  const { name, email, password, phone } = req.body;
  const user = await authRepository.getUserByEmail(email);
  if (user) return res.status(401).json({ message: "registered user" });
  const saltRound = Number(process.env.SALT_ROUND);
  const hashedPw = await bcrypt.hash(password, saltRound);
  await authRepository.insertUser({
    name,
    email,
    password: hashedPw,
    phone,
    cart: [],
    isAdmin: false,
    address1: "",
    address2: "",
    zipcode: "",
    createdAt: dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ss"),
    tmpOrders: [],
    orders: [],
  });
  return res.sendStatus(201);
}

export async function deleteUser(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user)
    return res.status(400).json({
      message: "get user error",
    });
  await authRepository.deleteUser(user.id);
  return res.sendStatus(200);
}

//------------------------------//

export async function getUserInfo(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  await Promise.all(
    user.cart.map(async (cart) => {
      const product = await productRepository.getProductById(cart.productId);
      if (!product) {
        const newCart = user.cart.filter(
          (product) =>
            product.productId !== cart.productId ||
            product.stock.size !== cart.stock.size
        );
        await authRepository.updateCart(user.id, newCart);
        return;
      }
      return;
    })
  );
  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cart: user.cart,
    isAdmin: user.isAdmin,
    address1: user.address1,
    address2: user.address2,
    zipcode: user.zipcode,
    createdAt: user.createdAt,
    orders: user.orders,
  });
}

export async function updateProfile(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { name, phone, address1, address2, zipcode, password, newPassword } =
    req.body;
  if (password) {
    if (password.trim().length < 6 || password.trim().length > 20)
      return res
        .status(401)
        .json({ message: "기존 비밀번호를 입력해주세요.(6자 이상 20자 이하)" });
    if (!newPassword) {
      return res
        .status(401)
        .json({ message: "새 비밀번호를 입력해주세요.(6자 이상 20자 이하)" });
    }
  }
  if (newPassword) {
    if (newPassword.trim().length < 6 || password.trim().length > 20)
      return res
        .status(401)
        .json({ message: "새 비밀번호를 입력해주세요.(6자 이상 20자 이하)" });
    if (!password) {
      return res
        .status(401)
        .json({ message: "기존 비밀번호를 입력해주세요.(6자 이상 20자 이하)" });
    }
  }
  if (password) {
    if (newPassword) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res
          .status(401)
          .json({ message: "기존 비밀번호가 잘못되었습니다." });
      }
      if (password === newPassword) {
        return res
          .status(401)
          .json({ message: "새 비밀번호가 기존 비밀번호와 동일합니다." });
      } else {
        const saltRound = Number(process.env.SALT_ROUND);
        const hashedPw = await bcrypt.hash(newPassword, saltRound);
        await authRepository.resetPassword(user.id, hashedPw);
      }
    }
  }
  await authRepository.updateUser(user.id, {
    name,
    phone,
    address1,
    address2,
    zipcode,
  });
  return res.sendStatus(200);
}

//------------------------------//

export async function addToCart(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { productId, size } = req.body;
  if (!productId || !size)
    return res.status(400).json({ message: "get req body error" });
  const product = await productRepository.getProductById(productId);
  if (!product)
    return res.status(400).json({
      message: "get product error",
    });

  const findAddToCartProductStockIndex = product.stock.findIndex(
    (stock) => stock.size === size
  );
  if (findAddToCartProductStockIndex === -1)
    return res.status(400).json({
      message: "get product error",
    });
  if (product.stock[findAddToCartProductStockIndex]["qty"] <= 0)
    return res.status(400).json({
      message: "sold out",
    });
  const findAddToCartProductInMyCart = user.cart.filter(
    (product) => product.productId === productId
  );
  if (findAddToCartProductInMyCart) {
    const checkAlreadyInMyCart = findAddToCartProductInMyCart.find(
      (product) => product.stock.size === size
    );
    if (checkAlreadyInMyCart) {
      return res.status(400).json({
        message: "product is already in cart",
      });
    }
  }
  const newCart = [
    ...user.cart,
    {
      productId: product.id,
      stock: {
        size,
        qty: 1,
      },
      createdAt: dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ss"),
    },
  ];
  await authRepository.updateCart(user.id, newCart);
  return res.sendStatus(200);
}

export async function updateUserCart(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { cartStock, qty } = req.body;
  if (!cartStock || !qty)
    return res.status(40).json({ message: "get body error" });

  const product = await productRepository.getProductById(cartStock.productId);
  if (!product) return res.status(401).json({ message: "get product error" });

  const findUpdateToCartProductStockIndex = product.stock.findIndex(
    (stock) => stock.size === cartStock.stock.size
  );
  if (findUpdateToCartProductStockIndex === -1)
    return res.status(400).json({
      message: "get product size error",
    });
  if (product.stock[findUpdateToCartProductStockIndex]["qty"] <= 0)
    return res.status(400).json({
      message: "sold out",
    });
  const findUpdateToCartProductInMyCartIndex = user.cart.findIndex(
    (product) =>
      product.productId === cartStock.productId &&
      product.stock.size === cartStock.stock.size
  );

  let newCart = user.cart;
  if (qty === 1) {
    if (
      cartStock.stock.qty + 1 >
      product.stock[findUpdateToCartProductStockIndex]["qty"]
    )
      return res.status(400).json({
        message: "not enough qty",
      });
    else newCart[findUpdateToCartProductInMyCartIndex].stock.qty += 1;
  } else {
    if (cartStock.stock.qty - 1 === 0) {
      newCart = user.cart.filter(
        (product) =>
          product.productId !== cartStock.productId ||
          product.stock.size !== cartStock.stock.size
      );
    } else if (
      cartStock.stock.qty - 1 >
      product.stock[findUpdateToCartProductStockIndex]["qty"]
    ) {
      newCart[findUpdateToCartProductInMyCartIndex].stock.qty =
        product.stock[findUpdateToCartProductStockIndex]["qty"];
    } else newCart[findUpdateToCartProductInMyCartIndex].stock.qty -= 1;
  }
  await authRepository.updateCart(user.id, newCart);
  return res.sendStatus(200);
}

export async function deleteUserCart(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { cartStock } = req.body;
  if (!cartStock) return res.status(400).json({ message: "get cart error" });
  const product = await productRepository.getProductById(cartStock.productId);
  if (!product) return res.status(401).json({ message: "get product error" });

  // const findUpdateToCartProductStockIndex = product.stock.findIndex(
  //   (stock) => stock.size === cartStock.stock.size
  // );
  // if (findUpdateToCartProductStockIndex === -1)
  //   return res.status(400).json({
  //     message: "get product error",
  //   });
  const newCart = user.cart.filter(
    (product) =>
      product.productId !== cartStock.productId ||
      product.stock.size !== cartStock.stock.size
  );
  await authRepository.updateCart(user.id, newCart);
  return res.sendStatus(200);
}

export async function getUserCartProducts(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  let products = await Promise.all(
    user.cart.map(async (cart) => {
      const product = await productRepository.getProductById(cart.productId);
      if (!product) {
        const newCart = user.cart.filter(
          (product) =>
            product.productId !== cart.productId ||
            product.stock.size !== cart.stock.size
        );
        await authRepository.updateCart(user.id, newCart);
        return null;
      }
      return {
        ...product,
        cartStock: cart,
      };
    })
  );
  products = products.filter((product) => product !== null);
  if (!products)
    return res.status(401).json({ message: "get cart products error" });
  return res.status(200).json(products);
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await authRepository.getUserByEmail(email);
  if (!user) return res.status(401).json({ message: "unregistered user" });
  const token = await createJwtTokenInResetPassword(email);
  try {
    await sendResetPasswordEmail(email, token);
  } catch (error) {
    return res.status(409).json({ message: "send reset password email error" });
  }
  return res.sendStatus(200);
}

export async function resetPassword(req, res) {
  const { password, token } = req.body;
  if (!token)
    return res.status(401).json({
      message: "token error",
    });
  let user;
  await jwt.verify(
    token,
    process.env.JWT_SECRET_KEY,
    async (error, decoded) => {
      if (error) {
        return res.status(401).json({
          message: "expired token",
        });
      }
      user = await authRepository.getUserByEmail(decoded.email);
      if (!user) {
        return res.status(401).json({
          message: "unregistered user",
        });
      }
    }
  );
  const saltRound = Number(process.env.SALT_ROUND);
  const hashedPw = await bcrypt.hash(password, saltRound);
  await authRepository.resetPassword(user.id, hashedPw);
  return res.sendStatus(200);
}

//------------------------------//

async function createJwtToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_SEC,
  });
}

async function createJwtTokenInResetPassword(email) {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_RESET_EMAIL_EXPIRES_SEC,
  });
}

// function setToken(res, token) {
//   const options = {
//     maxAge: process.env.JWT_EXPIRES_SEC,
//     httpOnly: true,
//     sameSite: "none",
//     secure: true,
//   };
//   res.cookie("token", token, options);
// }
