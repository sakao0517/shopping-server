import * as categoryRepository from "../data/category.js";

export async function getCategory(req, res) {
  const category = await categoryRepository.getCategory();
  if (!category)
    return res.status(400).json({
      message: "get category error",
    });
  return res.status(200).json(category);
}

export async function updateCategory(req, res) {
  const { id, newCategory } = req.body;
  if (!id || !newCategory)
    return res.status(400).json({
      message: "get category error",
    });
  await categoryRepository.updateCategory(id, newCategory);
  return res.sendStatus(200);
}
