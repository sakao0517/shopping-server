import { ObjectId } from "mongodb";
import { getOrders, getProducts, getUsers } from "../database/database.js";
import { fixIdArray } from "../utils/fixId.js";

// export async function getAdminAllProductsLength(q, query) {
//   const products = q
//     ? await getProducts()
//         .find({ name: { $regex: q } })
//         .sort(query)
//         .toArray()
//     : await getProducts().find().sort(query).toArray();
//   if (!products) return null;
//   return products.length;
// }

// export async function getAdminAllProducts(
//   q,
//   searchFilter,
//   category,
//   query,
//   page
// ) {
//   const products = q
//     ? await getProducts()
//         .find({ name: { $regex: q } })
//         .skip((Number(page) - 1) * 10)
//         .limit(10)
//         .sort(query)
//         .toArray()
//     : await getProducts()
//         .find()
//         .skip((Number(page) - 1) * 10)
//         .limit(10)
//         .sort(query)
//         .toArray();
//   if (!products) return null;
//   const fixIdProducts = await fixIdArray(products);
//   return fixIdProducts;
// }

export async function getAdminAllProductsLengthByCategory(
  q,
  searchFilter,
  category,
  query
) {
  let products = [];
  if (q) {
    const filter = {};
    if (searchFilter === "price") filter[searchFilter] = { $eq: Number(q) };
    else filter[searchFilter] = { $regex: q };
    if (category === "new") filter["isNew"] = true;
    else if (category !== "all") filter["category"] = category;
    products = await getProducts().find(filter).sort(query).toArray();
  } else {
    const filter = {};
    if (category === "new") filter["isNew"] = true;
    else if (category !== "all") filter["category"] = category;
    products = await getProducts().find(filter).sort(query).toArray();
  }
  if (!products) return null;
  return products.length;
}

export async function getAdminAllProductsByCategory(
  q,
  searchFilter,
  category,
  query,
  page
) {
  let products = [];
  if (q) {
    const filter = {};
    if (searchFilter === "price") filter[searchFilter] = { $eq: Number(q) };
    else filter[searchFilter] = { $regex: q };
    if (category === "new") filter["isNew"] = true;
    else if (category !== "all") filter["category"] = category;
    products = await getProducts()
      .find(filter)
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .sort(query)
      .toArray();
  } else {
    const filter = {};
    if (category === "new") filter["isNew"] = true;
    else if (category !== "all") filter["category"] = category;
    products = await getProducts()
      .find(filter)
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .sort(query)
      .toArray();
  }
  if (!products) return null;
  const fixIdProducts = await fixIdArray(products);
  return fixIdProducts;
}

export async function addAdminProduct(newProduct) {
  await getProducts().insertOne(newProduct);
}

export async function updateAdminProduct(id, newProduct) {
  await getProducts().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...newProduct,
      },
    }
  );
}

export async function deleteAdminProduct(id) {
  await getProducts().deleteOne({ _id: new ObjectId(id) });
}

//------------------------------//

export async function getAdminAllUsers(q, searchFilter, query, page) {
  let users = {};
  if (q) {
    const filter = {};
    filter[searchFilter] = { $regex: q };
    users = await getUsers()
      .find(filter)
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .sort(query)
      .toArray();
  } else {
    users = await getUsers()
      .find()
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .sort(query)
      .toArray();
  }
  if (!users) return null;
  const fixIdUsers = await fixIdArray(users);
  return fixIdUsers;
}

export async function getAdminAllUsersLength(q, searchFilter, query, page) {
  let users = {};
  if (q) {
    const filter = {};
    filter[searchFilter] = { $regex: q };
    users = await getUsers().find(filter).sort(query).toArray();
  } else {
    users = await getUsers().find().sort(query).toArray();
  }
  if (!users) return null;
  return users.length;
}

export async function updateAdminUser(id, newUser) {
  await getUsers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...newUser,
      },
    }
  );
}

export async function deleteAdminUser(id) {
  await getUsers().deleteOne({ _id: new ObjectId(id) });
}

//------------------------------//

export async function getAdminAllOrders(q, searchFilter, query, page) {
  const orders = await getOrders().find().sort({ createdAt: -1 }).toArray();
  if (!orders) return null;
  const fixIdOrders = await fixIdArray(orders);
  return fixIdOrders;
}

export async function getAdminAllOrdersLengthByFilter(
  q,
  searchFilter,
  orderStatus,
  query
) {
  let orders = {};
  if (q) {
    const filter = {};
    if (searchFilter === "amount") filter[searchFilter] = { $eq: Number(q) };
    else filter[searchFilter] = { $regex: q };
    if (orderStatus) filter["orderStatus"] = orderStatus;
    orders = await getOrders().find(filter).sort(query).toArray();
  } else {
    orders = await getOrders()
      .find(orderStatus ? { orderStatus } : {})
      .sort(query)
      .toArray();
  }
  if (!orders) return null;
  return orders.length;
}

export async function getAdminAllOrdersByFilter(
  q,
  searchFilter,
  orderStatus,
  query,
  page
) {
  let orders = [];
  if (q) {
    const filter = {};
    if (searchFilter === "amount") filter[searchFilter] = { $eq: Number(q) };
    else filter[searchFilter] = { $regex: q };
    if (orderStatus) filter["orderStatus"] = orderStatus;
    orders = await getOrders()
      .find(filter)
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .sort(query)
      .toArray();
  } else {
    orders = await getOrders()
      .find(orderStatus ? { orderStatus } : {})
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .sort(query)
      .toArray();
  }
  if (!orders) return null;
  const fixIdOrders = await fixIdArray(orders);
  return fixIdOrders;
}

export async function deleteAdminOrder(id) {
  await getOrders().deleteOne({ orderId: id });
}
