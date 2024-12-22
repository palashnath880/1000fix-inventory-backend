import { Request, Response } from "express";
import { prisma } from "../server";
import { SkuCode } from "@prisma/client";

// create sku
const create = async (req: Request<{}, {}, SkuCode>, res: Response) => {
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

// get all sku
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

// update sku
const update = async (
  req: Request<{ skuId: string }, {}, SkuCode>,
  res: Response
) => {
  try {
    const skuId = req.params.skuId;
    const data = req.body;

    // if update name
    if (data?.name) {
      const getSku = await prisma.skuCode.findFirst({
        where: { name: data.name, id: { not: skuId } },
      });
      if (getSku) {
        return res.status(409).send({ message: `${data.name} already exists` });
      }
    }

    // update
    await prisma.skuCode.update({ data: data, where: { id: skuId } });
    res.send({ message: `Updated` });
  } catch (err) {
    res.status(400).send(err);
  }
};

// delete sku
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

export default { create, get, deleteSkuCode, update };
