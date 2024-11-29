import { sign } from "jsonwebtoken";
import { prisma } from "../server";
import { genSalt, hash } from "bcrypt";

// generate a username based on the name
const generateUsername = async (name: string) => {
  try {
    let username = name.toLowerCase();
    username = username.replace(/\s/g, "");
    if (username.length > 10) {
      username = username.substring(0, 10);
    }
    // check user with the username
    const getUser = await prisma.user.findMany({ where: { username } });
    if (getUser && getUser?.length > 0) {
      username = `${username}${getUser.length + 1}`;
    }
    return username;
  } catch (err) {
    throw new Error(`Sorry! username couldn't be generate`);
  }
};

// hash plain password
const hashPassword = async (plainPassword: string) => {
  const salt = await genSalt(10);
  const password = await hash(plainPassword, salt);
  return password;
};

// generate access token
const genAccessToken = async (user: any) => {
  try {
    const SECRET_KEY: string = process.env.JWT_SECRET_KEY || "";
    const token = await sign(user, SECRET_KEY, {
      expiresIn: "10m",
    });
    return token;
  } catch (err: any) {
    throw new Error(err?.message || "Unable to generate access token");
  }
};

// generate refresh token
const genRefreshToken = async (user: any) => {
  try {
    const REFRESH_SECRET_KEY: string = process.env.REFRESH_SECRET_KEY || "";
    const token = await sign(user, REFRESH_SECRET_KEY, {
      expiresIn: "7 days",
    });
    return token;
  } catch (err: any) {
    throw new Error(err?.message || "Unable to generate refresh token");
  }
};

export { generateUsername, hashPassword, genAccessToken, genRefreshToken };
