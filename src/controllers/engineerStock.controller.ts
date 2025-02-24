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

// branch transfer report
const brTrReport = async (
  req: Request<
    {},
    {},
    {},
    { fromDate: string; toDate: string; userId: string }
  >,
  res: Response
) => {
  try {
    const role = req.cookies?.user?.role;
    const branchId = req.cookies?.user?.branchId;
    const engineerId = req.query.userId;
    let fromDate: any = req.query.fromDate;
    fromDate = fromDate ? new Date(fromDate) : new Date();
    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(toDate)
      : new Date(moment.tz("Asia/Dhaka").format("YYYY-MM-DD"));

    const result = await prisma.engineerStock.findMany({
      where: {
        AND: [
          engineerId ? { engineerId } : {},
          {
            createdAt: {
              gte: fromDate,
              lte: toDate,
            },
          },
          role === "admin" ? {} : { branchId },
        ],
      },
      include: {
        engineer: true,
        branch: true,
        skuCode: {
          include: {
            item: { include: { model: { include: { category: true } } } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    res.send(result);
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

    const skuCodes = await prisma.skuCode.findMany({
      where: skuCode
        ? { id: skuCode }
        : model
        ? { item: { modelId: model } }
        : category
        ? { item: { model: { categoryId: category } } }
        : {},
      select: {
        id: true,
      },
    });

    for (const skuId of skuCodes) {
      const stock = await engineerStockBySkuId(userId, skuId.id);
      if (stock.quantity > 0 || stock.defective > 0) {
        stock && stockArr.push(stock);
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

// return faulty and good stock by branch
const stockByBranch = async (
  req: Request<{ type: "return" | "faulty" }>,
  res: Response
) => {
  try {
    const branchId = req?.cookies?.user?.branchId;
    const type = req.params.type;

    const result = await prisma.engineerStock.findMany({
      where: { branchId: branchId, status: "open", type: type },
      include: {
        engineer: true,
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

// get stock by engineer
const getByEngineer = async (
  req: Request<
    { id: string },
    {},
    {},
    { category: string; model: string; sku: string }
  >,
  res: Response
) => {
  try {
    const id = req.params.id;
    const model = req.query.model;
    const category = req.query.category;
    const sku = req.query.sku;

    const stockArr: any[] = [];
    const skuCodes = await prisma.skuCode.findMany({
      where: sku
        ? { id: sku }
        : model
        ? { item: { modelId: model } }
        : category
        ? { item: { model: { categoryId: category } } }
        : {},
      select: {
        id: true,
      },
    });

    const engineer = await prisma.user.findUnique({ where: { id } });

    for (const skuCode of skuCodes) {
      const stock = await engineerStockBySkuId(id, skuCode.id);
      if (stock.quantity !== 0 || stock.defective !== 0) {
        stockArr.push({ ...stock, engineer });
      }
    }

    res.send(stockArr);
  } catch (err) {
    res.status(400).send(err);
  }
};

// send defective to branch
const sendDefective = async (
  req: Request<
    {},
    {},
    {
      skuCodeId: string;
      quantity: number;
      engineerId: string;
      branchId: string;
      type: "defective";
    }
  >,
  res: Response
) => {
  try {
    const data = req.body;
    data.engineerId = req.cookies?.user?.id;
    data.branchId = req.cookies?.user?.branchId;
    data.type = "defective";

    const result = await prisma.engineerStock.create({ data });
    return res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// send defective report
const sendDeReport = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const id = req.cookies?.user?.id;
    let fromDate: any = req.query.fromDate;
    fromDate = fromDate ? new Date(fromDate) : new Date();
    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(toDate)
      : new Date(moment.tz("Asia/Dhaka").format("YYYY-MM-DD"));

    const result = await prisma.engineerStock.findMany({
      where: {
        engineerId: id,
        type: "defective",
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
      orderBy: [{ createdAt: "desc" }],
    });
    return res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// engineer send defective by branch
const cscDefective = async (req: Request, res: Response) => {
  try {
    const branchId = req.cookies?.user?.branchId;

    const result = await prisma.engineerStock.findMany({
      where: {
        branchId,
        status: "open",
        type: "defective",
        skuCode: { isDefective: true },
      },
      include: {
        engineer: true,
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

// branch defective actions
const cscActions = async (
  req: Request<
    { id: string },
    {},
    { status: "received" | "rejected"; note: string | null }
  >,
  res: Response
) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const result = await prisma.engineerStock.update({
      where: { id },
      data: {
        ...data,
        endAt: moment.tz("Asia/Dhaka").toISOString(),
      },
    });

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// csc defective receive/ reject report
const cscDeReport = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.branchId;
    let fromDate: any = req.query.fromDate;
    fromDate = fromDate ? new Date(fromDate) : new Date();

    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(toDate)
      : new Date(moment.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));

    const result = await prisma.engineerStock.findMany({
      where: {
        branchId,
        type: "defective",
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
        status: { in: ["received", "rejected"] },
      },
      include: {
        engineer: true,
        skuCode: {
          include: {
            item: { include: { model: { include: { category: true } } } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    res.send(result);
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
  stockByBranch,
  getByEngineer,
  brTrReport,
  sendDefective,
  sendDeReport,
  cscDefective,
  cscActions,
  cscDeReport,
};
