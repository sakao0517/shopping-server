import { ObjectId } from "mongodb";
import { getCategorys } from "../database/database.js";
import { fixId } from "../utils/fixId.js";

export async function getCategory() {
  const category = await getCategorys().find().toArray();
  if (!category) return null;
  const fixIdCategory = await fixId(category[0]);
  return fixIdCategory;
}

export async function updateCategory(id, newCategory) {
  await getCategorys().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        category: newCategory,
      },
    },
    { upsert: true }
  );
}
