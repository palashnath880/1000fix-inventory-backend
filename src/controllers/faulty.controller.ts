import { Request, Response } from "express";
import { prisma } from "../server";
import moment from "moment-timezone";

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
        skuCode: {
          include: {
            item: { include: { model: { include: { category: true } } } },
          },
        },
      },
    });
    return res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default {
  create,
  faultyAction,
  report,
  headFaulty,
};
