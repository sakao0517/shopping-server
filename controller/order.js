import * as authRepository from "../data/auth.js";
import * as orderRepository from "../data/order.js";
import * as productRepository from "../data/product.js";
import dayjs from "dayjs";

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
      createdAt: dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ss"),
    },
    ...tmpOrders,
  ];
  await authRepository.updateUserTmpOrder(user.id, newOrders);
  return res.sendStatus(200);
}

export async function verifyOrder(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { orderId, amount } = req.body;
  if (!orderId || !amount)
    return res.status(400).json({ message: "get body error" });
  const tmpOrder = user.tmpOrders.find((order) => order.orderId === orderId);
  if (!tmpOrder) return res.status(400).json({ message: "get order error" });
  if (amount !== tmpOrder.amount)
    return res.status(400).json({ message: "amount error" });

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
  if (checkQty)
    return res.status(400).json({
      message: `${
        enoughProduct.name
      }상품의 ${enoughProduct.size.toUpperCase()}사이즈 수량이 재고수량 보다 많습니다.`,
    });

  return res.sendStatus(200);
}

export async function successOrder(req, res) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "get user error" });
  const { orderId, paymentKey } = req.body;
  if (!orderId || !paymentKey)
    return res.status(400).json({ message: "get body error" });
  const tmpOrder = user.tmpOrders.find((order) => order.orderId === orderId);
  const newOrder = {
    ...tmpOrder,
    succeedAt: dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ss"),
    paymentKey,
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
  return res.sendStatus(200);
}
