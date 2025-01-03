import * as authRepository from "../data/auth.js";
import jwt from "jsonwebtoken";

export async function isAuth(req, res, next) {
  let token;

  const authHeader = req.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    token = req.cookies["token"];
  }
  if (!token) {
    return res.status(401).json({ message: "auth token error" });
  }
  await jwt.verify(
    token,
    process.env.JWT_SECRET_KEY,
    async (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: "token error" });
      }
      const user = await authRepository.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "token error" });
      }
      req.userId = user.id;
      next();
    }
  );
}
