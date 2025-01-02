import { ObjectId } from "mongodb";
import { getUsers } from "../database/database.js";
import { fixId } from "../utils/fixId.js";

export async function getUserByEmail(email) {
  const user = await getUsers().findOne({ email });
  if (!user) return null;
  const fixIdUser = await fixId(user);
  return fixIdUser;
}

export async function getUserById(id) {
  const user = await getUsers().findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  const fixIdUser = await fixId(user);
  return fixIdUser;
}

export async function insertUser(user) {
  await getUsers().insertOne(user);
}

export async function updateUser(id, newProfile) {
  await getUsers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...newProfile,
      },
    },
    { upsert: true }
  );
}

export async function deleteUser(id) {
  await getUsers().deleteOne({ _id: new ObjectId(id) });
}

export async function updateCart(id, newCart) {
  await getUsers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        cart: newCart,
      },
    },
    { upsert: true }
  );
}

export async function updateUserTmpOrder(id, newTmpOrder) {
  await getUsers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        tmpOrders: newTmpOrder,
      },
    },
    { upsert: true }
  );
}

export async function updateUserOrders(id, newOrders) {
  await getUsers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        orders: newOrders,
      },
    },
    { upsert: true }
  );
}

export async function resetPassword(id, newPassword) {
  await getUsers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        password: newPassword,
      },
    }
  );
}
