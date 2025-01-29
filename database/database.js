import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_URL;
let db;

export async function connectMongo() {
  const client = new MongoClient(url);
  db = client.db("shopping");
}
export function getProductPageSettings() {
  return db.collection("productPageSetting");
}
export function getHomeWallpapers() {
  return db.collection("home");
}
export function getCategorys() {
  return db.collection("category");
}

export function getProducts() {
  return db.collection("products");
}

export function getUsers() {
  return db.collection("users");
}

export function getOrders() {
  return db.collection("orders");
}
