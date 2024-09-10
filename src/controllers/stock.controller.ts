import { Request, Response } from "express";
import { prisma } from "../server";

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
const entry = async (req: Request<{}, {}, Stock>, res: Response) => {
  try {
    const newStock = req.body;
    const branchId = req.cookies?.user?.branchId;
    newStock.senderId = branchId;
    newStock.type = "entry";

    // insert stock
    const result = await prisma.stock.create({ data: newStock });
    res.send(result);
  } catch (err) {
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
        createdAt: { gte: fromDate, lte: toDate },
      },
    });

    return list;
  } catch (err) {
    res.status(400).send(err);
  }
};

// stock transfer
const transfer = async (
  req: Request<{}, {}, { transferList: Stock[] }>,
  res: Response
) => {
  try {
    let list = req.body.transferList;
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
    const branchId = req.params.branchId;

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const list = await prisma.stock.findMany({
      where: {
        type: "transfer",
        senderId: branchId,
        createdAt: { gte: fromDate, lte: toDate },
      },
    });

    return list;
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { entry, transfer, entryList, transferList, transferToEngineer };
