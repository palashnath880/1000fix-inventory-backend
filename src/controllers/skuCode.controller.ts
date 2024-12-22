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

    // get sku by item id
    const getSkuByItem = await prisma.skuCode.findUnique({
      where: { itemId: skuCode.itemId },
    });
    if (getSkuByItem) {
      return res
        .status(409)
        .send({ message: "SKU code already exists at this item" });
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
            modelId: true,
            model: {
              select: { name: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });
    res.send(skuCodes);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

const deleteSkuCode = async (
  req: Request<{ skuId: string }>,
  res: Response
) => {
  try {
    const skuId = req.params.skuId;
    const result = await prisma.skuCode.delete({
      where: { id: skuId },
      include: {
        challanItems: true,
        enStock: true,
        faulty: true,
        jobItems: true,
        scrapItems: true,
        stockItems: true,
        stocks: true,
      },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, get, deleteSkuCode };
