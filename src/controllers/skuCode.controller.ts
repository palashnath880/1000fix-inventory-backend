import { Request, Response } from "express";
import { prisma } from "../server";

const create = async (
  req: Request<{}, {}, { name: string; itemId: string; isDefective: boolean }>,
  res: Response
) => {
  try {
    const skuCode = req.body;

    // get sku code
    const getSku = await prisma.skuCode.findUnique({
      where: { name: skuCode.name },
    });
    if (getSku) {
      return res.status(409).send({ message: "SKU code already exists" });
    }

    // insert
    const result = await prisma.skuCode.create({ data: skuCode });
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
    const skuCodes = await prisma.skuCode.findMany({
      where: search ? { name: { contains: search } } : {},
      include: {
        item: {
          select: {
            name: true,
            uom: true,
          },
          include: {
            model: {
              select: { name: true },
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
    });
    res.send(skuCodes);
  } catch (err) {
    res.status(400).send(err);
  }
};

const deleteSkuCode = async (
  req: Request<{ skuId: string }>,
  res: Response
) => {
  try {
    const skuId = req.params.skuId;
    const result = await prisma.skuCode.delete({ where: { id: skuId } });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, get, deleteSkuCode };
