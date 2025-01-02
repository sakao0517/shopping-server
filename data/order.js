import { getOrders } from "../database/database.js";
import { fixId, fixIdArray } from "../utils/fixId.js";

export async function getAllOrders() {
  const orders = await getOrders().find().sort({ createdAt: -1 }).toArray();
  if (!products) return null;
  const fixIdOrders = await fixIdArray(orders);
  return fixIdOrders;
}

export async function getOrderById(id) {
  const order = await getOrders().findOne({ orderId: id });
  if (!order) return null;
  const fixIdOrder = await fixId(order);
  return fixIdOrder;
}

export async function insertOrder(newOrder) {
  await getOrders().insertOne(newOrder);
}

export async function updateOrderById(id, newOrder) {
  await getOrders().updateOne(
    { orderId: id },
    {
      $set: {
        ...newOrder,
      },
    }
  );
}
