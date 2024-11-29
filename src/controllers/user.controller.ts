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
      branchId: string;
    }
  >,
  res: Response
) => {
  try {
    const user = req.body;
    const branchId = req.cookies?.user?.branchId || "";

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

    if (user.role === "engineer") {
      user.branchId = branchId;
    }

    // insert user
    const result = await prisma.user.create({
      data: user,
    });

    res.status(201).send(result);
  } catch (err) {
    console.log(err);
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
      include: { branch: { select: { name: true, id: true } } },
    });

    res.send(users);
  } catch (err) {
    res.send(err).status(400);
  }
};

// get by id
const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.cookies.user;
    const id = user?.id;

    if (!id) {
      return res.status(404).send({ message: `User not found` });
    }

    const getUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        branchId: true,
        role: true,
        createdAt: true,
        branch: true,
      },
    });
    return res.send(getUser);
  } catch (err) {
    res.status(400).send(err);
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

// update user password by admin
const updatePwd = async (
  req: Request<{}, {}, { id: string; password: string }>,
  res: Response
) => {
  try {
    const userId = req.body.id;
    const password = req.body.password;
    const hashedPwd = await hashPassword(password);

    // update pwd
    const result = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPwd },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, deleteUser, update, get, getById, updatePwd, getMe };
