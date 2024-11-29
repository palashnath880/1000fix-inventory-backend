import { NextFunction } from "express";
import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { prisma } from "./server";

export const isAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    const SECRET_KEY: string = process.env.JWT_SECRET_KEY || "";

    if (!token) {
      return res.status(401).send({ message: `Invalid access token` });
    }

    const ac_token = token.split(" ")[1];
    const decoded: any = await verify(ac_token, SECRET_KEY);
    const userId = decoded?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(401).send({ message: `Invalid user` });
    }

    req.cookies = { user: user };
    next();
  } catch (err) {}
};
