import { Request, Response } from "express";
import moment from "moment-timezone";
import { prisma } from "../server";

// scrap report
const scrap = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    let fromDate: any = req.query.fromDate;
    fromDate = fromDate ? new Date(fromDate) : new Date();
    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(toDate)
      : new Date(moment.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));

    const result = await prisma.scrap.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      include: {
        items: {
          include: {
            skuCode: {
              include: {
                item: { include: { model: { include: { category: true } } } },
              },
            },
          },
        },
      },
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// engineer return faulty and good stock report by branch
const enReRepByBranch = async (
  req: Request<
    { type: "return" | "faulty" | "defective" },
    {},
    {},
    { fromDate: string; toDate: string }
  >,
  res: Response
) => {
  try {
    const type = req.params.type;
    const branchId = req.cookies?.user?.branchId;
    let fromDate: any = req.query.fromDate;
    fromDate = fromDate ? new Date(fromDate) : new Date();

    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(toDate)
      : new Date(moment.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));

    const result = await prisma.engineerStock.findMany({
      where: { type, branchId, createdAt: { gte: fromDate, lte: toDate } },
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

export default { scrap, enReRepByBranch };
