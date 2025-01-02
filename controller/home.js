import * as homeRepository from "../data/home.js";

export async function getHomeWallpaer(req, res) {
  const wallpaper = await homeRepository.getHomeWallpaper();
  if (!wallpaper)
    return res.status(400).json({
      message: "get wallpaper error",
    });
  return res.status(200).json(wallpaper);
}

export async function updateWallpaper(req, res) {
  const { id, pc, mobile } = req.body;
  if (!id || !pc || !mobile)
    return res.status(400).json({
      message: "get wallpaper error",
    });
  await homeRepository.updateHomeWallpaper(id, { pc, mobile });
  return res.sendStatus(200);
}
