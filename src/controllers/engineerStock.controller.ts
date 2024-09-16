import { Request, Response } from "express";
import { prisma } from "../server";
import moment from "moment-timezone";
import { engineerStockBySkuId } from "../utils/stock.utils";

// transfer to engineer
const transfer = async (req: Request, res: Response) => {
  try {
    const stock = req.body.list;
    const result = await prisma.engineerStock.createMany({ data: stock });
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// status handler
const statusUpdate = async (
  req: Request<
    { id: string },
    {},
    { note: string; status: "received" | "rejected"; endAt: string }
  >,
  res: Response
) => {
  try {
    const id = req.params.id;
    const data = req.body;
    data.endAt = moment.tz("Asia/Dhaka").toISOString();

    const result = await prisma.engineerStock.update({
      where: { id },
      data: data,
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// own stock
const ownStock = async (
  req: Request<
    {},
    {},
    {},
    {
      category: string;
      model: string;
      skuCode: string;
    }
  >,
  res: Response
) => {
  try {
    const userId = req.cookies?.user?.id;

    const category = req?.query?.category;
    const model = req?.query?.model;
    const skuCode = req?.query?.skuCode;

    const stockArr: any[] = [];

    if (skuCode) {
      // get stocks by sku code
      const stock = await engineerStockBySkuId(userId, skuCode);
      stockArr.push(stock);
    } else if (model) {
      // get stocks by model
      const getSkuCodes = await prisma.skuCode.findMany({
        where: { item: { modelId: model } },
        select: {
          id: true,
        },
      });
      for (const sku of getSkuCodes) {
        const stock = await engineerStockBySkuId(userId, sku.id);
        stockArr.push(stock);
      }
    } else if (category) {
      // get stocks by model
      const getSkuCodes = await prisma.skuCode.findMany({
        where: { item: { model: { categoryId: category } } },
        select: {
          id: true,
        },
      });
      for (const sku of getSkuCodes) {
        const stock = await engineerStockBySkuId(userId, sku.id);
        stockArr.push(stock);
      }
    } else {
      // get stocks by model
      const getSkuCodes = await prisma.skuCode.findMany({});
      for (const sku of getSkuCodes) {
        const stock = await engineerStockBySkuId(userId, sku.id);
        stockArr.push(stock);
      }
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

// engineer stock by sku id
const stockBySkuId = async (
  req: Request<{ userId: string; skuId: string }>,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    const skuId = req.params.skuId;
    const stock = await engineerStockBySkuId(userId, skuId);
    res.send(stock);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { transfer, statusUpdate, ownStock, stockBySkuId };
