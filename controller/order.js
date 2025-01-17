import * as authRepository from "../data/auth.js";
import * as orderRepository from "../data/order.js";
import * as productRepository from "../data/product.js";
import dayjs from "dayjs";
import { sendOrderEmail } from "./mail2.js";
import { koreaTimeNow } from "../utils/koreaTimeNow.js";
import { PortOneClient } from "@portone/server-sdk";

const portone = PortOneClient({
  secret: process.env.V2_API_SECRET,
});

dayjs.locale("ko");

export async function uploadTmpOrder(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  let error = false;
  let errorMessage = "";
  let checkQty = false;
  let enoughProduct = { name: "", size: "" };
  const promise = await Promise.all(
    user.cart.map(async (cart) => {
      const product = await productRepository.getProductById(cart.productId);
      if (product === -1) {
        error = true;
        errorMessage = "get product error";
        return;
      }
      const findAddToCartProductStockIndex = product.stock.findIndex(
        (stock) => stock.size === cart.stock.size
      );
      if (findAddToCartProductStockIndex === -1) {
        error = true;
        errorMessage = "get product size error";
        return;
      }
      if (product.stock[findAddToCartProductStockIndex].qty < cart.stock.qty) {
        enoughProduct.name = product.name;
        enoughProduct.size = product.stock[findAddToCartProductStockIndex].size;
        checkQty = true;
      }
    })
  );
  if (error)
    return res.status(400).json({
      message: errorMessage,
    });
  if (checkQty)
    return res.status(400).json({
      message: `${
        enoughProduct.name
      }상품의 ${enoughProduct.size.toUpperCase()}사이즈 수량이 재고수량 보다 많습니다.`,
    });
  const {
    userId,
    orderId,
    shipping,
    subtotal,
    amount,
    orderName,
    email,
    name,
    phone,
    address1,
    address2,
    zipcode,
    cart,
  } = req.body;

  if (
    !userId ||
    !orderId ||
    shipping == null ||
    subtotal == null ||
    amount == null ||
    !orderName ||
    !email ||
    !name ||
    !phone ||
    !address1 ||
    !address2 ||
    !zipcode ||
    !cart ||
    cart.length === 0
  )
    return res.status(400).json({
      message: "문제가 발생했습니다. 다시 시도하세요.",
    });
  const tmpOrders = user.tmpOrders;
  const newOrders = [
    {
      userId,
      orderId,
      shipping,
      subtotal,
      amount,
      orderName,
      email,
      name,
      phone,
      address1,
      address2,
      zipcode,
      cart,
      orderStatus: "주문 확인 중",
      trackingNumber: "-",
      isCancel: false,
      cancels: [],
      createdAt: dayjs(koreaTimeNow()).format("YYYY-MM-DDTHH:mm:ss"),
    },
    ...tmpOrders,
  ];
  await authRepository.updateUserTmpOrder(user.id, newOrders);
  return res.sendStatus(200);
}

export async function verifyOrder(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: "get body error" });

  const url = `https://api.portone.io/payments/${orderId}/cancel`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `PortOne ${process.env.V2_API_SECRET}`,
    },
    body: '{"reason":"결제 검증 오류"}',
  };
  const tmpOrder = user.tmpOrders.find((order) => order.orderId === orderId);
  if (!tmpOrder) {
    const response = await fetch(url, options);
    if (!response.ok) {
      return res.status(400).json({
        message: `결제에 오류가 발생했습니다.(관리자에게 문의해주세요.)`,
      });
    }
    return res.status(400).json({ message: "get order error" });
  }

  const userOrder = user.orders.find((order) => order.orderId === orderId);
  if (userOrder) {
    if (userOrder.succeedAt)
      return res.status(400).json({ message: "order already paid" });
  }

  let checkQty = false;
  let enoughProduct = { name: "", size: "" };
  await Promise.all(
    user.cart.map(async (cart) => {
      const product = await productRepository.getProductById(cart.productId);
      const findAddToCartProductStockIndex = product.stock.findIndex(
        (stock) => stock.size === cart.stock.size
      );
      if (product.stock[findAddToCartProductStockIndex].qty < cart.stock.qty) {
        enoughProduct.name = product.name;
        enoughProduct.size = product.stock[findAddToCartProductStockIndex].size;
        checkQty = true;
      }
    })
  );
  if (checkQty) {
    const response = await fetch(url, options);
    if (!response.ok) {
      return res.status(400).json({
        message: `결제에 오류가 발생했습니다.(관리자에게 문의해주세요.)`,
      });
    }
    return res.status(400).json({
      message: `${
        enoughProduct.name
      }상품의 ${enoughProduct.size.toUpperCase()}사이즈 수량이 재고수량 보다 많습니다.`,
    });
  }

  return res.sendStatus(200);
}

export async function successOrder(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: "get body error" });

  if (typeof orderId !== "string")
    return res.status(400).send({ message: "get orderId error" });

  const actualPayment = await portone.payment.getPayment({
    paymentId: orderId,
  });
  if (actualPayment.status !== "PAID")
    return res.status(400).json({ message: "payment not paid" });

  const tmpOrder = user.tmpOrders.find((order) => order.orderId === orderId);
  if (!tmpOrder) return res.status(400).json({ message: "get order error" });

  const newOrder = {
    ...tmpOrder,
    succeedAt: dayjs(koreaTimeNow()).format("YYYY-MM-DDTHH:mm:ss"),
  };
  await orderRepository.insertOrder(newOrder);
  const orders = user.orders;
  const newOrders = [newOrder, ...orders];
  await authRepository.updateUserOrders(user.id, newOrders);
  for (let cart of user.cart) {
    const product = await productRepository.getProductById(cart.productId);
    const findAddToCartProductStockIndex = product.stock.findIndex(
      (stock) => stock.size === cart.stock.size
    );
    const newStock = product.stock;
    newStock[findAddToCartProductStockIndex]["qty"] -= cart.stock.qty;
    await productRepository.updateProductStockById(product.id, newStock);
  }
  const newCart = [];
  await authRepository.updateCart(user.id, newCart);
  try {
    await sendOrderEmail(newOrder.email, newOrder);
  } catch (error) {
    return res.sendStatus(200);
  }
  return res.sendStatus(200);
}
