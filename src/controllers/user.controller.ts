import { Request, Response } from "express";
import { prisma } from "../server";
import { generateUsername, hashPassword } from "../utils/user.utils";

// user create controller
const create = async (
  req: Request<
    {},
    {},
    {
      name: string;
      email: string;
      role: "admin" | "manager" | "engineer";
      password: string;
      username: string;
    }
  >,
  res: Response
) => {
  try {
    const user = req.body;

    // get user by email
    const getUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    // if user exists at this user.email
    if (getUser) {
      return res.status(409).send({ message: "User exists at this email" });
    }

    // generate username
    const username = await generateUsername(user.name);
    user.username = username;

    // hash password
    const password = await hashPassword(user.password);
    user.password = password;

    // insert user
    const result = await prisma.user.create({
      data: user,
    });

    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// get all user
const get = async (
  req: Request<{}, {}, {}, { search: string }>,
  res: Response
) => {
  try {
    const search = req.query.search;

    // get users
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {},
      orderBy: { name: "asc" },
      include: { branch: true },
    });

    res.send(users);
  } catch (err) {
    res.send(err).status(400);
  }
};

// get by id
const getById = async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.send(user);
  } catch (err) {
    res.send(err).status(400);
  }
};

// user update controller
const update = async (
  req: Request<
    { userId: string },
    {},
    { name: string; role: "admin" | "manager" | "engineer"; branchId: string }
  >,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    const result = await prisma.user.update({
      data: data,
      where: { id: userId },
    });
    res.send(result);
  } catch (err) {
    res.send(err).status(400);
  }
};

// user delete controller
const deleteUser = async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const userId = req.params.userId;
    const result = await prisma.user.delete({ where: { id: userId } });
    res.send(result);
  } catch (err) {
    res.send(err).status(400);
  }
};

export default { create, deleteUser, update, get, getById };
