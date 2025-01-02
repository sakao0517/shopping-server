import * as authRepository from "../data/auth.js";

export async function isAdmin(req, res, next) {
  const user = await authRepository.getUserById(req.userId);
  if (!user) return res.status(401).json({ message: "token error" });
  if (!user.isAdmin) return res.status(401).json({ message: "admin error" });

  next();
}
