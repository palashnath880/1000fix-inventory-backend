import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { prisma } from "../server";

const verifyAuthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    const SECRET_KEY: string = process.env.JWT_SECRET_KEY || "";

    if (token) {
      const authToken = token.split(" ")[1];
      const decoded: any = await verify(authToken, SECRET_KEY);
      if (decoded) {
        const userId = decoded?.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        req.cookies = { user: user };
        next();
      } else {
        return res.status(401).send({ message: `Unauthorized` });
      }
    } else {
      return res.status(401).send({ message: `Unauthorized` });
    }
  } catch (err) {
    res.status(401).send({ message: `Unauthorized`, err });
  }
};

export { verifyAuthToken };
