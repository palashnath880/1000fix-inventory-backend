import { Request, Response } from "express";
import { prisma } from "../server";

const create = async (
  req: Request<{}, {}, { name: string; categoryId: string }>,
  res: Response
) => {
  try {
    const model = req.body;

    // get model
    const getModel = await prisma.model.findUnique({
      where: { name: model.name },
    });
    if (getModel) {
      return res.status(409).send({ message: "Model already exists" });
    }

    // insert
    const result = await prisma.model.create({ data: model });
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
    const models = await prisma.model.findMany({
      where: search ? { name: { contains: search } } : {},
    });
    res.send(models);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteModel = async (
  req: Request<{ modelId: string }>,
  res: Response
) => {
  try {
    const modelId = req.params.modelId;
    const result = await prisma.model.delete({ where: { id: modelId } });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, get, deleteModel };
