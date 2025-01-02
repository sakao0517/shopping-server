import { ObjectId } from "mongodb";
import { getHomeWallpapers } from "../database/database.js";
import { fixId } from "../utils/fixId.js";

export async function getHomeWallpaper() {
  const wallpaper = await getHomeWallpapers().find().toArray();
  if (!wallpaper) return null;
  const fixIdWallpaper = await fixId(wallpaper[0]);
  return fixIdWallpaper;
}

export async function updateHomeWallpaper(id, newHomeWallpaper) {
  await getHomeWallpapers().updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...newHomeWallpaper,
      },
    },
    { upsert: true }
  );
}
