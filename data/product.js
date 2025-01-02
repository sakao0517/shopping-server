import { ObjectId } from "mongodb";
import { getProducts } from "../database/database.js";
import { fixId, fixIdArray } from "../utils/fixId.js";

export async function getNewProductsLength() {
  const products = await getProducts()
    .find({ isNew: true })
    .sort({ createdAt: -1 })
    .toArray();
  if (!products) return null;
  return products.length;
}

export async function getAllProductsLengthByCategory(category) {
  const products = await getProducts()
    .find({ category })
    .sort({ createdAt: -1 })
    .toArray();
  if (!products) return null;
  return products.length;
}

export async function getNewProductsByPage(page, productMaxLength) {
  const products = await getProducts()
    .find({ isNew: true })
    .skip((Number(page) - 1) * Number(productMaxLength))
    .limit(Number(productMaxLength))
    .sort({ createdAt: -1 })
    .toArray();
  if (!products) return null;
  const fixIdProducts = await fixIdArray(products);
  return fixIdProducts;
}

export async function getAllProductsByCategoryByPage(
  category,
  page,
  productMaxLength
) {
  const products = await getProducts()
    .find({ category })
    .skip((Number(page) - 1) * Number(productMaxLength))
    .limit(Number(productMaxLength))
    .sort({ createdAt: -1 })
    .toArray();
  if (!products) return null;
  const fixIdProducts = await fixIdArray(products);
  return fixIdProducts;
}

export async function getProductById(id) {
  const product = await getProducts().findOne({ _id: new ObjectId(id) });
  if (!product) return null;
  const fixIdProduct = await fixId(product);
  return fixIdProduct;
}

export async function getProductBySearch(q) {
  const products = await getProducts()
    .find({ name: { $regex: q } })
    .sort({ createdAt: -1 })
    .toArray();
  if (!products) return null;
  const fixIdProducts = await fixIdArray(products);
  return fixIdProducts;
}

export async function updateProductStockById(id, newStock) {
  await getProducts().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        stock: newStock,
      },
    }
  );
}
