import { Request, Response } from "express";
import { prisma } from "../server";
import moment from "moment-timezone";
import { Prisma } from "@prisma/client";

type JobItem = {
  price: number;
  quantity: number;
  skuCodeId: string;
  jobId: string;
};

type JobType = {
  jobNo: string;
  imeiNo: string;
  serviceType: string;
  sellFrom: "engineer" | "branch";
  branchId: string | null;
  engineerId: string | null;
  items: JobItem[];
};

// create job
const create = async (req: Request<{}, {}, JobType>, res: Response) => {
  try {
    const newJob = req.body;
    const branchId = req.cookies?.user?.branchId;

    // insert
    const result = await prisma.job.create({
      data: {
        imeiNo: newJob.imeiNo,
        jobNo: newJob.jobNo,
        sellFrom: newJob.sellFrom,
        branchId: branchId,
        serviceType: newJob.serviceType,
        engineerId: newJob?.engineerId || null,
        items: {
          create: newJob.items,
        },
      },
    });

    res.status(201).send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// job list
const jobList = async (
  req: Request<
    {},
    {},
    {},
    {
      fromDate: string;
      toDate: string;
      skuId: string;
      filter: "" | "engineer" | "branch";
      engineers: string[];
    }
  >,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.branchId;
    const filter = req.query.filter;
    const skuId = req.query.skuId;
    let engineers = req.query.engineers || [];
    if (typeof engineers === "string") engineers = [engineers];

    let fromDate: any = req.query.fromDate;

    fromDate = fromDate
      ? new Date(fromDate)
      : new Date(moment().format("YYYY-MM-DD"));

    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(moment(toDate).add(1, "days").format("YYYY-MM-DD"))
      : new Date(moment().add(1, "days").format("YYYY-MM-DD"));

    // where
    const where: Prisma.JobWhereInput = {
      createdAt: { gte: fromDate, lte: toDate },
      branchId,
    };
    if (skuId) where.items = { some: { skuCodeId: skuId } }; // filter by sku id

    if (filter === "branch") {
      where.engineerId = null;
    } else if (filter === "engineer") {
      where.engineerId = { in: engineers };
    }

    // get job entry list
    const result = await prisma.job.findMany({
      where,
      include: {
        items: { include: { skuCode: { include: { item: true } } } },
        engineer: {
          select: {
            name: true,
            email: true,
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

// job summary report
const jobSummaryList = async (
  req: Request<
    {},
    {},
    {},
    {
      fromDate: string;
      toDate: string;
    }
  >,
  res: Response
) => {
  try {
    let fromDate: any = req.query.fromDate;
    fromDate = fromDate
      ? new Date(fromDate)
      : new Date(moment().tz("Asia/Dhaka").format("YYYY-MM-DD"));

    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(moment(toDate).add(1, "days").format("YYYY-MM-DD"))
      : new Date(moment.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));

    // get job entry summary list
    const result = await prisma.jobItem.findMany({
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
      orderBy: [{ createdAt: "desc" }],
    });

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

// get job entry graph by month
const jobEntryGraph = async (
  req: Request<{}, {}, {}, { month: string }>,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.branchId;
    const month = req.query.month;
    const start = new Date();
    start.setMonth(parseInt(month) - 1);
    start.setDate(1);
    const end = new Date();
    end.setMonth(parseInt(month));
    end.setDate(1);

    const result: any = {};
    const rows = await prisma.jobItem.groupBy({
      _sum: { quantity: true },
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        job: {
          branchId: branchId,
        },
      },
      orderBy: { createdAt: "asc" },
    });
    for (const row of rows) {
      const date = new Date(row.createdAt);
      const day = date.getDate();
      if (result[day]) {
        result[day] += row._sum.quantity;
      } else {
        result[day] = row._sum.quantity;
      }
    }

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, jobList, jobSummaryList, jobEntryGraph };
