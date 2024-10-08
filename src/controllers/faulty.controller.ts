import { Request, Response } from "express";
import { prisma } from "../server";
import moment from "moment-timezone";
import { getFaultyStock } from "../utils/stock.utils";

// send faulty to csc head
const create = async (
  req: Request<
    {},
    {},
    {
      list: { branchId: string }[];
    }
  >,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.branchId;
    let list = req.body.list;
    list = list.map((i) => ({ ...i, branchId }));

    const result = await prisma.faulty.createMany({ data: list });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// faulty stock list
const headFaulty = async (req: Request, res: Response) => {
  try {
    const result = await prisma.faulty.findMany({
      where: { status: "open" },
      include: {
        branch: true,
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

// faulty stock receive reject
const faultyAction = async (
  req: Request<
    { id: string },
    {},
    { status: "received" | "rejected"; endReason: string; endAt: string }
  >,
  res: Response
) => {
  try {
    const id = req.params.id;
    const data = req.body;

    data.endAt = moment.tz("Asia/Dhaka").toISOString();

    const result = await prisma.faulty.update({
      data: data,
      where: { id, status: "open" },
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// faulty csc report
const report = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const user = req.cookies?.user;
    const branchId = user?.branchId;

    const fromDate = req.query.fromDate
      ? new Date(req.query.fromDate)
      : new Date();
    const toDate = req.query.toDate
      ? new Date(req.query.toDate)
      : new Date(moment.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));

    // csc general faulty send report
    if (user?.role === "manager") {
      const result = await prisma.faulty.findMany({
        where: {
          branchId: branchId,
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
      return res.send(result);
    }

    // csc head faulty receive reject report
    const result = await prisma.faulty.findMany({
      where: {
        status: { in: ["received", "rejected"] },
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        branch: true,
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

// own faulty stock
const ownFaulty = async (
  req: Request<{}, {}, {}, { skuId: string }>,
  res: Response
) => {
  try {
    const skuId = req.query.skuId;
    const user = req.cookies?.user;
    const isAdmin: boolean = user?.role === "admin";

    const stockArr: any[] = [];

    const skuCodes = await prisma.skuCode.findMany({
      where: skuId ? { id: skuId } : {},
      orderBy: [{ item: { model: { category: { name: "asc" } } } }],
      include: {
        item: { include: { model: { include: { category: true } } } },
      },
    });
    for (const skuCode of skuCodes) {
      const stock = await getFaultyStock(user?.branchId, skuCode.id, isAdmin);
      if (stock > 0) {
        stockArr.push({ skuCode, faulty: stock });
      }
    }

    res.send(stockArr);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default {
  create,
  faultyAction,
  report,
  headFaulty,
  ownFaulty,
};
