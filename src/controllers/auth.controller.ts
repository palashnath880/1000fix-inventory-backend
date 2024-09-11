import { Request, Response } from "express";
import { prisma } from "../server";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

// login
const login = async (
  req: Request<{}, {}, { login: string; password: string }>,
  res: Response
) => {
  try {
    const login = req.body.login;
    const password = req.body.password;
    const SECRET_KEY: string = process.env.JWT_SECRET_KEY || "";

    // get user
    const getUsers = await prisma.user.findMany({
      where: {
        OR: [{ email: login }, { username: login }],
      },
      take: 1,
    });
    if (getUsers && getUsers?.length > 0) {
      const user = getUsers[0];
      if (await compare(password, user.password)) {
        const getUser = await prisma.user.findUnique({
          where: { id: user.id },
        });
        if (getUser) {
          // generate jwt token
          const token = await sign(getUser, SECRET_KEY, {
            expiresIn: 60 * 60 * 24 * 7,
          });
          res.send({ token });
        }
      } else {
        return res.status(401).send({ message: "Incorrect password" });
      }
    } else {
      return res.status(409).send({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

const loadUser = async (req: Request, res: Response) => {
  try {
    const userId = req.cookies?.user?.id;

    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      include: { branch: true },
    });
    if (user) {
      const keys = Object.keys(user);
      const newObj: any = {};
      for (const key of keys) {
        if (key !== "password") {
          newObj[key] = user[key];
        }
      }
      return res.send(newObj);
    }
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

const sendPasswordResetLink = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { login, loadUser, sendPasswordResetLink };
