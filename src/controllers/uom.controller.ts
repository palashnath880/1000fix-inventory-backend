import { Request, Response } from "express";
import { prisma } from "../server";

// uom create
const create = async (
  req: Request<{}, {}, { name: string }>,
  res: Response
) => {
  try {
    const data = req.body;

    // check uom is exists
    const getUom = await prisma.uom.findUnique({ where: { name: data.name } });
    if (getUom) {
      return res.status(400).send({ message: `${data.name} already exists` });
    }

    // insert
    const result = await prisma.uom.create({ data: data });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// get all uom
const getAll = async (req: Request, res: Response) => {
  try {
    const result = await prisma.uom.findMany({
      where: {},
      orderBy: { name: "asc" },
    });
    return result;
  } catch (err) {
    res.status(400).send(err);
  }
};

// delete uom
const deleteUOM = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = req.params.id;

    // delete uom item
    const result = await prisma.uom.delete({ where: { id } });
    return result;
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, getAll, deleteUOM };
