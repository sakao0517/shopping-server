import * as productRepository from "../data/product.js";
import * as productPageSettingRepository from "../data/productPageSetting.js";
import dotenv from "dotenv";
dotenv.config();

export async function getProductsByPage(req, res) {
  const { category } = req.params;
  const { page } = req.query;
  let products;
  let totalLength;
  const productPageSetting =
    await productPageSettingRepository.getProductPageSetting();
  if (category === "new") {
    products = await productRepository.getNewProductsByPage(
      page,
      productPageSetting.productMaxLength
    );
    totalLength = await productRepository.getNewProductsLength();
  } else {
    products = await productRepository.getAllProductsByCategoryByPage(
      category,
      page,
      productPageSetting.productMaxLength
    );
    totalLength = await productRepository.getAllProductsLengthByCategory(
      category
    );
  }
  if (!products)
    return res.status(400).json({
      message: "get product error",
    });
  return res.status(200).json({ products, totalLength });
}

export async function getProduct(req, res) {
  const { id } = req.params;
  const product = await productRepository.getProductById(id);
  if (!product)
    return res.status(400).json({
      message: "get product error",
    });
  return res.status(200).json(product);
}

export async function getSearchProduct(req, res) {
  const query = req.query;
  if (!query.q) {
    return res.status(200).json([]);
  }
  const products = await productRepository.getProductBySearch(query.q);
  if (!products) return res.status(200).json(JSON.stringify([]));
  return res.status(200).json(products);
}
