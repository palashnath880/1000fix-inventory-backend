import { Request, Response } from "express";
import { prisma } from "../server";
import { branchStockBySkuId } from "../utils/stock.utils";

type Stock = {
  type: "entry" | "transfer" | "return" | "defective" | "engineer";
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

    if (skuCode) {
      // get stocks by sku code
      const stock = await branchStockBySkuId(branchId, skuCode);
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
        const stock = await branchStockBySkuId(branchId, sku.id);
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
        const stock = await branchStockBySkuId(branchId, sku.id);
        stockArr.push(stock);
      }
    } else {
      // get stocks by model
      const getSkuCodes = await prisma.skuCode.findMany({});
      for (const sku of getSkuCodes) {
        const stock = await branchStockBySkuId(branchId, sku.id);
        stockArr.push(stock);
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

//  engineer stock transfer
const transferToEngineer = async (
  req: Request<{}, {}, { transferList: Stock[] }>,
  res: Response
) => {
  try {
    let list = req.body.transferList;
    const branchId = req.cookies?.user?.branchId;

    const newList: Stock[] = list.map((item) => {
      item.senderId = branchId;
      item.type = "engineer";
      item.status = "open";
      return item;
    });

    const result = await prisma.stock.createMany({ data: newList });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock entry list
const transferList = async (
  req: Request<
    { branchId: string },
    {},
    {},
    { fromDate: string; toDate: string }
  >,
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

export default {
  entry,
  transfer,
  entryList,
  transferList,
  transferToEngineer,
  ownStock,
  ownStockBySkuId,
  receiveStock,
};
