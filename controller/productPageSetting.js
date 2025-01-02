import * as productPageSettingRepository from "../data/productPageSetting.js";

export async function getProductPageSetting(req, res) {
  const productPageSetting =
    await productPageSettingRepository.getProductPageSetting();
  if (!productPageSetting)
    return res.status(400).json({
      message: "get productPageSetting error",
    });
  return res.status(200).json(productPageSetting);
}

export async function updateProductPageSetting(req, res) {
  const { id, prodcutMaxLength, newProdcutMaxLength } = req.body;
  if (!id || !prodcutMaxLength || !newProdcutMaxLength)
    return res.status(400).json({
      message: "get productPageSetting error",
    });
  await productPageSettingRepository.updateHomeWallpaper(id, {
    prodcutMaxLength,
    newProdcutMaxLength,
  });
  return res.sendStatus(200);
}
