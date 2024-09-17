import { Request, Response } from "express";
import { prisma } from "../server";
import moment from "moment-timezone";
import { engineerStockBySkuId } from "../utils/stock.utils";

type FaultyReturn = {
  note: string;
  quantity: number;
  skuCodeId: string;
  type: "faulty" | "transfer" | "return";
  engineerId: string;
  branchId: string;
};

// transfer to engineer
const transfer = async (req: Request, res: Response) => {
  try {
    const stock = req.body.list;
    const branchId = req.cookies?.user?.branchId;
    const list: any[] = stock.map((i: any) => ({ ...i, branchId }));

    const result = await prisma.engineerStock.createMany({ data: list });
    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// receive stock list
const receive = async (req: Request, res: Response) => {
  try {
    const userId = req.cookies?.user?.id;
    const result = await prisma.engineerStock.findMany({
      where: { engineerId: userId, status: "open", type: "transfer" },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        skuCode: {
          include: {
            item: { include: { model: { include: { category: true } } } },
          },
        },
      },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// status handler
const update = async (
  req: Request<
    { stockId: string },
    {},
    { note: string; status: "received" | "rejected"; endAt: string }
  >,
  res: Response
) => {
  try {
    const id = req.params.stockId;
    const data = req.body;
    data.endAt = moment.tz("Asia/Dhaka").toISOString();

    const result = await prisma.engineerStock.update({
      where: { id },
      data: data,
    });
    res.send(result);
  } catch (err) {
    console.log(err);
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
      skuId: string;
    }
  >,
  res: Response
) => {
  try {
    const userId = req.cookies?.user?.id;

    const category = req?.query?.category;
    const model = req?.query?.model;
    const skuCode = req?.query?.skuId;

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

    res.send(stockArr);
  } catch (err) {
    res.status(400).send(err);
  }
};

//  stock return
const stockReturn = async (
  req: Request<{}, {}, { list: FaultyReturn[] }>,
  res: Response
) => {
  try {
    const data = req.body.list;
    const engineerId = req.cookies?.user?.id;
    const branchId = req.cookies?.user?.branchId;

    const list: FaultyReturn[] = data.map((i) => ({
      ...i,
      engineerId: engineerId,
      type: "return",
      branchId: branchId,
    }));

    const result = await prisma.engineerStock.createMany({ data: list });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// faulty stock return
const faultyReturn = async (
  req: Request<{}, {}, { list: FaultyReturn[] }>,
  res: Response
) => {
  try {
    const data = req.body.list;
    const engineerId = req.cookies?.user?.id;
    const branchId = req.cookies?.user?.branchId;

    const list: FaultyReturn[] = data.map((i) => ({
      ...i,
      engineerId: engineerId,
      type: "faulty",
      branchId: branchId,
    }));

    const result = await prisma.engineerStock.createMany({ data: list });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock transfer report
const stockReport = async (
  req: Request<
    { userId: string },
    {},
    {},
    { fromDate: string; toDate: string }
  >,
  res: Response
) => {
  try {
    const engineerId = req.params.userId;
    const fromDate = req.query?.fromDate ? new Date(req.query.fromDate) : "";
    const toDate = req.query?.toDate ? new Date(req.query.toDate) : "";

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const result = await prisma.engineerStock.findMany({
      where: {
        engineerId: engineerId,
        type: "transfer",
        status: { in: ["received", "rejected"] },
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        skuCode: {
          include: {
            item: { include: { model: { include: { category: true } } } },
          },
        },
      },
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock faulty and stock return report
const report = async (
  req: Request<
    { userId: string },
    {},
    {},
    { fromDate: string; toDate: string; type: "return" | "faulty" }
  >,
  res: Response
) => {
  try {
    const engineerId = req.params.userId;
    const fromDate = req.query?.fromDate ? new Date(req.query.fromDate) : "";
    const toDate = req.query?.toDate ? new Date(req.query.toDate) : "";
    const type = req.query?.type || "return";

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const result = await prisma.engineerStock.findMany({
      where: {
        engineerId: engineerId,
        type: type,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        skuCode: {
          include: {
            item: { include: { model: { include: { category: true } } } },
          },
        },
      },
    });

    res.send(result);
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

export default {
  transfer,
  receive,
  update,
  ownStock,
  stockBySkuId,
  faultyReturn,
  report,
  stockReport,
  stockReturn,
};
