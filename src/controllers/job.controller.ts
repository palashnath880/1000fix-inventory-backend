import { Request, Response } from "express";
import { prisma } from "../server";

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

const jobList = async (
  req: Request<{ id: string }, {}, {}, { fromDate: string; toDate: string }>,
  res: Response
) => {
  try {
    const id = req.cookies?.user?.branchId;

    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : "";
    const toDate = req.query.toDate ? new Date(req.query.toDate) : "";

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    // get list
    const result = await prisma.job.findMany({
      where: {
        branchId: id,
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        items: { include: { skuCode: true } },
        engineer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, jobList };
