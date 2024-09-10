import { Request, Response } from "express";
import { prisma } from "../server";

const create = async (
  req: Request<{}, {}, { name: string; modelId: string; uom: string }>,
  res: Response
) => {
  try {
    const item = req.body;

    // get item
    const getItem = await prisma.item.findUnique({
      where: { name: item.name },
    });
    if (getItem) {
      return res.status(409).send({ message: "Item already exists" });
    }

    // insert
    const result = await prisma.item.create({ data: item });
    res.send(result);
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
    const items = await prisma.item.findMany({
      where: search ? { name: { contains: search } } : {},
    });
    res.send(items);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteItem = async (req: Request<{ itemId: string }>, res: Response) => {
  try {
    const itemId = req.params.itemId;
    const result = await prisma.item.delete({ where: { id: itemId } });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, get, deleteItem };
