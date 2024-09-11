import { Request, Response } from "express";
import { prisma } from "../server";

const create = async (
  req: Request<{}, {}, { name: string; address: string }>,
  res: Response
) => {
  try {
    const branch = req.body;

    // check branch
    const getBranch = await prisma.branch.findUnique({
      where: { name: branch.name },
    });
    if (getBranch) {
      return res.status(409).send({ message: "This branch already exists" });
    }

    // insert branch
    const result = await prisma.branch.create({ data: branch });
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

const get = async (
  req: Request<{}, {}, {}, { search: string }>,
  res: Response
) => {
  try {
    const search = req.query.search;

    const branches = await prisma.branch.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { address: { contains: search } },
            ],
          }
        : {},
      include: {
        users: {
          select: { name: true, id: true, email: true, username: true },
        },
      },
    });

    res.send(branches);
  } catch (err) {}
};

const update = async (
  req: Request<
    { branchId: string },
    {},
    { name: string; address: string; users: string[] }
  >,
  res: Response
) => {
  try {
    const branchId = req.params.branchId;
    const data = req.body;
    const updateData: any = {};

    if (data?.name) updateData.name = data?.name;
    if (data?.address) updateData.address = data?.address;

    if (Array.isArray(data?.users)) {
      // update branchId is null which users are deselected
      await prisma.user.updateMany({
        data: { branchId: null },
        where: { branchId: branchId, id: { notIn: data?.users } },
      });

      // update branchId in the selected users
      await prisma.user.updateMany({
        data: { branchId: branchId },
        where: { id: { in: data?.users } },
      });
    }

    const result = await prisma.branch.update({
      data: updateData,
      where: { id: branchId },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteBranch = async (
  req: Request<{ branchId: string }>,
  res: Response
) => {
  try {
    const branchId = req.params.branchId;
    const result = await prisma.branch.delete({ where: { id: branchId } });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, get, update, deleteBranch };
