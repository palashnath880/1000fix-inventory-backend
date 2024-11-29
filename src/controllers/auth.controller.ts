import { Request, Response } from "express";
import { prisma } from "../server";
import { compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import {
  genAccessToken,
  genRefreshToken,
  hashPassword,
} from "../utils/user.utils";
import { send_reset_email } from "../utils/mail.utils";

// login
const login = async (
  req: Request<{}, {}, { login: string; password: string }>,
  res: Response
) => {
  try {
    const { login, password } = req.body;

    // find user by login user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { username: login }],
      },
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (await compare(password, user.password)) {
      const accessToken = await genAccessToken(user);
      const refreshToken = await genRefreshToken(user);

      return res.send({ ac_token: accessToken, re_token: refreshToken });
    } else {
      return res.status(400).send({ message: "Incorrect password" });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
};

// send reset password link
const sendPwdResetLink = async (
  req: Request<{}, {}, { login: string }>,
  res: Response
) => {
  try {
    const login = req.body.login;
    const SECRET_KEY: string = process.env.JWT_SECRET_KEY || "";
    const CLIENT_URL: string = process.env.CLIENT_URL || "";

    // get user by email or username
    const getUser = await prisma.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] },
    });
    if (!getUser) {
      return res.status(404).send({ message: `User not found.` });
    }

    const token = await sign(getUser, SECRET_KEY, {
      expiresIn: 60 * 60 * 1,
    });

    // insert the database
    const resetRes = await prisma.resetPwd.create({
      data: { jwtToken: token, userId: getUser.id },
    });

    const url = `${CLIENT_URL}/update-pwd/?tokenId=${resetRes.id}`;

    const sentEmail: any = await send_reset_email(
      url,
      getUser.username,
      getUser.email
    );
    if (sentEmail) {
      return res.send({ message: `link sent` });
    } else {
      return res.status(400).send({ message: `link doesn't sent` });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// update reset password
const updateResetPass = async (
  req: Request<{}, {}, { password: string; tokenId: string }>,
  res: Response
) => {
  try {
    const id = req.body.tokenId;
    const password = req.body.password;
    const SECRET_KEY: string = process.env.JWT_SECRET_KEY || "";

    const result = await prisma.resetPwd.findUnique({
      where: { id, status: "open" },
    });
    if (!result) return res.status(404).send({ message: `Invalid token` });
    const token = result.jwtToken;

    const decoded = await verify(token, SECRET_KEY);

    if (decoded) {
      const hashPwd = await hashPassword(password);
      // update user pass
      await prisma.user.update({
        data: { password: hashPwd },
        where: { id: result.userId },
      });

      await prisma.resetPwd.update({
        data: { status: "close" },
        where: { id },
      });
      return res.send({ message: `password updated` });
    }

    return res.status(400).send({ message: `Invalid token` });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
};

// change password
const changePassword = async (
  req: Request<{}, {}, { prev: string; new: string }>,
  res: Response
) => {
  try {
    const prevPwd = req.body.prev;
    const newPwd = req.body.new;
    const userId = req.cookies?.user?.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (!(await compare(prevPwd, user.password))) {
      return res
        .status(401)
        .send({ message: "Previous password doesn't matched" });
    }

    const password = await hashPassword(newPwd);

    const result = await prisma.user.update({
      data: { password },
      where: { id: userId },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// refresh token
const refreshToken = async (req: Request, res: Response) => {
  try {
    const REFRESH_SECRET_KEY: string = process.env.REFRESH_SECRET_KEY || "";
    const { re_token } = req.cookies;

    console.log(re_token);

    if (!re_token) {
      return res.status(401).send(`Access Denied. No refresh token provided.`);
    }

    const decoded: any = await verify(re_token, REFRESH_SECRET_KEY);

    console.log(decoded);
    const user = await prisma.user.findUnique({
      where: { id: decoded?.id },
    });
    const ac_token = await genAccessToken(user);
    console.log(ac_token);
    return res.send({ ac_token });
  } catch (err) {
    return res.status(400).send(err);
  }
};

export default {
  login,
  sendPwdResetLink,
  changePassword,
  updateResetPass,
  refreshToken,
};
