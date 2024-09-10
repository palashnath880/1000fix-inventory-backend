import { prisma } from "../server";
import { genSalt, hash } from "bcrypt";

const generateUsername = async (name: string) => {
  try {
    let username = name.toLowerCase();
    username = username.replace(/\s/g, "_");
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

const hashPassword = async (plainPassword: string) => {
  const salt = await genSalt(10);
  const password = await hash(plainPassword, salt);
  return password;
};

export { generateUsername, hashPassword };
