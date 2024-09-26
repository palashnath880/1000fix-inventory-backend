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

    const result = await prisma.stock.findMany({
      where: { type: "scrap", createdAt: { gte: fromDate, lte: toDate } },
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

export default { scrap };
