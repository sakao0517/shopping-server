import { ObjectId } from "mongodb";
import { getProductPageSettings } from "../database/database.js";
import { fixId } from "../utils/fixId.js";

export async function getProductPageSetting() {
  const productPageSetting = await getProductPageSettings().find().toArray();
  if (!productPageSetting) return null;
  const fixIdProductPageSetting = await fixId(productPageSetting[0]);
  return fixIdProductPageSetting;
}

export async function updateHomeWallpaper(id, newProductPageSetting) {
  await getProductPageSettings().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...newProductPageSetting,
      },
    },
    { upsert: true }
  );
}
