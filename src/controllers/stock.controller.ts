import { Request, Response } from "express";
import { prisma } from "../server";
import {
  branchStockBySkuId,
  engineerStockBySkuId,
  getBranchDefective,
} from "../utils/stock.utils";
import moment from "moment-timezone";
import { generateChallan } from "../utils/challan.utils";

type Stock = {
  type: "entry" | "transfer" | "defective" | "faulty";
  status: "open" | "approved" | "rejected" | "received" | "returned";
  price: number;
  quantity: number;
  skuCodeId: string;
  senderId: string;
  receiverId: string;
  rackNo: string;
  challan: string;
  note: string;
};

type PurchaseReturn = {
  senderId: string;
  type: "purchaseReturn";
  note: string;
  skuCodeId: string;
  quantity: number;
};

// stock entry
const entry = async (
  req: Request<{}, {}, { list: Stock[] }>,
  res: Response
) => {
  try {
    const body = req.body;
    const branchId = req.cookies?.user?.branchId;

    const data: Stock[] = body.list?.map((i) => {
      i.senderId = branchId;
      i.type = "entry";
      return i;
    });

    // insert stock
    const result = await prisma.stock.createMany({
      data: data,
      skipDuplicates: true,
    });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// stock entry list
const entryList = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const list = await prisma.stock.findMany({
      where: {
        type: "entry",
        createdAt: { gte: new Date(fromDate), lte: new Date(toDate) },
      },
      select: {
        price: true,
        createdAt: true,
        quantity: true,
        id: true,
        skuCode: {
          select: {
            name: true,
            isDefective: true,
            item: {
              select: {
                name: true,
                uom: true,
                model: {
                  select: { name: true, category: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });

    return res.send(list);
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
    const branchId = req?.cookies?.user?.branchId;
    const category = req?.query?.category;
    const model = req?.query?.model;
    const skuCode = req?.query?.skuCode;

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
      const stock = await branchStockBySkuId(branchId, skuId.id);
      if (stock.faulty || stock.quantity || stock.defective) {
        stock && stockArr.push(stock);
      }
    }

    res.send(stockArr);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// branch stock
const branchStock = async (
  req: Request<
    {},
    {},
    {},
    {
      category: string;
      model: string;
      skuCode: string;
      branch: string;
    }
  >,
  res: Response
) => {
  try {
    const branchId = req?.query?.branch;
    const category = req?.query?.category;
    const model = req?.query?.model;
    const skuCode = req?.query?.skuCode;

    const stockArr: any[] = [];

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });

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
      const stock = await branchStockBySkuId(branchId, skuId.id);
      if (stock.faulty || stock.quantity || stock.defective) {
        stock && stockArr.push({ ...stock, branch });
      }
    }

    res.send(stockArr);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// own stock by sku id
const ownStockBySkuId = async (
  req: Request<{}, {}, {}, { skuCodeId: string }>,
  res: Response
) => {
  try {
    const skuCodeId = req.query.skuCodeId;
    const branchId = req.cookies?.user?.branchId;
    const stock = await branchStockBySkuId(branchId, skuCodeId);
    res.send(stock);
  } catch (err) {
    res.status(400).send(err);
  }
};

// engineer stock
const engineerStockBySku = async (
  req: Request<{ engineerId: string; skuId: string }>,
  res: Response
) => {
  try {
    const engineerId = req.params.engineerId;
    const skuId = req.params.skuId;

    const stock = await engineerStockBySkuId(engineerId, skuId);
    res.send(stock);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock transfer
const transfer = async (
  req: Request<{}, {}, { list: Stock[] }>,
  res: Response
) => {
  try {
    let list = req.body.list;
    const branchId = req.cookies?.user?.branchId;
    const role = req.cookies?.user?.role;

    const newList: Stock[] = list.map((item) => {
      item.senderId = branchId;
      item.type = "transfer";
      if (role === "admin") {
        item.status = "approved";
      } else {
        item.status = "open";
      }
      return item;
    });

    const result = await prisma.stock.createMany({ data: newList });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// return
const returnStock = async (
  req: Request<{}, {}, { list: Stock[] }>,
  res: Response
) => {
  try {
    let list = req.body.list;
    const branchId = req.cookies?.user?.branchId;

    const newList: Stock[] = list.map((item) => {
      item.senderId = branchId;
      item.type = "faulty";
      item.status = "open";
      return item;
    });

    const result = await prisma.stock.createMany({ data: newList });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock receive
const receiveStock = async (req: Request, res: Response) => {
  try {
    const branchId = req?.cookies?.user?.branchId;
    const result = await prisma.stock.findMany({
      where: { receiverId: branchId, type: "transfer", status: "approved" },
      include: {
        sender: true,
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

//  stock status update
const statusUpdate = async (
  req: Request<
    { stockId: string },
    {},
    { status: "approved" | "rejected" | "received"; note: string | null }
  >,
  res: Response
) => {
  try {
    const stockId = req.params.stockId;
    const data: any = { ...req.body };
    if (data?.status !== "approved") {
      data.endAt = moment.tz("Asia/Dhaka").toISOString();
    }
    const result = await prisma.stock.update({ where: { id: stockId }, data });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock receive report
const receiveReport = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const branchId = req.cookies?.user?.branchId;

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const list = await prisma.stock.findMany({
      where: {
        type: "transfer",
        receiverId: branchId,
        createdAt: { gte: from, lte: to },
        status: { in: ["received", "rejected"] },
      },
      select: {
        quantity: true,
        createdAt: true,
        receiverId: true,
        receiver: {
          select: {
            name: true,
          },
        },
        skuCode: {
          select: {
            name: true,
            item: {
              select: {
                name: true,
                uom: true,
                model: {
                  select: {
                    name: true,
                    category: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.send(list);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock entry list
const transferList = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const branchId = req.cookies?.user?.branchId;

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const list = await prisma.stock.findMany({
      where: {
        type: "transfer",
        senderId: branchId,
        createdAt: { gte: from, lte: to },
      },
      select: {
        quantity: true,
        createdAt: true,
        receiverId: true,
        receiver: {
          select: {
            name: true,
          },
        },
        skuCode: {
          select: {
            name: true,
            item: {
              select: {
                name: true,
                uom: true,
                model: {
                  select: {
                    name: true,
                    category: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.send(list);
  } catch (err) {
    res.status(400).send(err);
  }
};

// approval stock
const approvalStock = async (req: Request, res: Response) => {
  try {
    const result = await prisma.stock.findMany({
      where: { type: "transfer", status: "open" },
      include: {
        receiver: true,
        sender: true,
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

// get defective by branch
const getDefective = async (
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
    const branchId = req?.cookies?.user?.branchId;
    const category = req?.query?.category;
    const model = req?.query?.model;
    const skuCode = req?.query?.skuCode;

    const stockArr: any[] = [];
    const skuIds: string[] = [];

    if (skuCode) {
      skuIds.push(skuCode);
    } else {
      let search = {};
      if (model) {
        search = { item: { modelId: model } };
      } else if (category) {
        search = { item: { model: { categoryId: category } } };
      }

      const skuCodes = await prisma.skuCode.findMany({
        where: search,
        select: {
          id: true,
        },
      });
      for (const sku of skuCodes) {
        skuIds.push(sku.id);
      }
    }

    // get defective by sku id
    for (const id of skuIds) {
      const getSku = await prisma.skuCode.findUnique({
        where: { id },
        include: {
          item: { include: { model: { include: { category: true } } } },
        },
      });
      const quantity = await getBranchDefective(branchId, id);
      if (quantity > 0) stockArr.push({ skuCode: getSku, quantity });
    }

    res.send(stockArr);
  } catch (err) {
    res.status(400).send(err);
  }
};

// defective to scrap
const sendDefective = async (
  req: Request<
    {},
    {},
    {
      list: {
        skuCodeId: string;
        quantity: number;
        type: "defective" | "scrap";
      }[];
    }
  >,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.branchId;
    let data = req.body.list;
    const challan: string = `DC-${generateChallan()}`;

    data = data.map((i) => ({ ...i, type: "defective" }));

    const result = await prisma.stock.create({
      data: {
        type: "defective",
        senderId: branchId,
        challan: challan,
        items: { create: data },
      },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// faulty to good stock
const moveToGood = async (
  req: Request<
    {},
    {},
    {
      skuCodeId: string;
      quantity: number;
      type: "fromFaulty";
      senderId: string;
    }
  >,
  res: Response
) => {
  try {
    const data = req.body;
    const branchId = req.cookies?.user?.branchId;

    data.senderId = branchId;
    data.type = "fromFaulty";

    const result = await prisma.stock.create({ data });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// purchase return
const purchaseReturn = async (
  req: Request<
    {},
    {},
    {
      list: PurchaseReturn[];
    }
  >,
  res: Response
) => {
  try {
    const list = req.body.list;
    const branchId: string = req.cookies?.user?.id;

    const data: any = list.map((i) => ({
      ...i,
      senderId: branchId,
      type: "purchaseReturn",
    }));

    const result = await prisma.stock.createMany({
      data,
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// purchase return list
const purchaseReturnList = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.id;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : "";
    const toDate = req.query.toDate ? new Date(req.query.toDate) : "";

    if (!fromDate || !toDate) return res.send([]);

    const result = await prisma.stock.findMany({
      where: {
        senderId: branchId,
        type: "purchaseReturn",
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

export default {
  entry,
  transfer,
  entryList,
  transferList,
  ownStock,
  ownStockBySkuId,
  receiveStock,
  statusUpdate,
  receiveReport,
  approvalStock,
  returnStock,
  engineerStockBySku,
  getDefective,
  sendDefective,
  moveToGood,
  purchaseReturn,
  purchaseReturnList,
  branchStock,
};
