import { Request, Response } from "express";
import { prisma } from "../server";

const create = async (
  req: Request<{}, {}, { name: string }>,
  res: Response
) => {
  try {
    const category = req.body;

    // check category
    const getCate = await prisma.category.findUnique({
      where: { name: category.name },
    });
    if (getCate) {
      return res.status(409).send({ message: `This category already exists` });
    }

    const result = await prisma.category.create({ data: category });
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
    const categories = await prisma.category.findMany({
      where: search
        ? {
            name: { contains: search },
          }
        : {},
    });

    res.send(categories);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteCategory = async (
  req: Request<{ categoryId: string }>,
  res: Response
) => {
  try {
    const categoryId = req.params.categoryId;
    const result = await prisma.category.delete({ where: { id: categoryId } });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, get, deleteCategory };
