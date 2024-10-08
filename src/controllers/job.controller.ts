import { Request, Response } from "express";
import { prisma } from "../server";
import moment from "moment-timezone";

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
  req: Request<
    { id: string },
    {},
    {},
    {
      fromDate: string;
      toDate: string;
      filter: "" | "engineer" | "branch";
      engineers: string[];
    }
  >,
  res: Response
) => {
  try {
    const branchId = req.cookies?.user?.branchId;
    const filter = req.query.filter;
    let engineers = req.query.engineers || [];
    if (typeof engineers === "string") engineers = [engineers];

    let fromDate: any = req.query.fromDate;

    fromDate = fromDate
      ? new Date(fromDate)
      : new Date(moment().tz("Asia/Dhaka").format("YYYY-MM-DD"));

    let toDate: any = req.query.toDate;
    toDate = toDate
      ? new Date(moment(toDate).add(1, "days").format("YYYY-MM-DD"))
      : new Date(moment.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));

    let search = {};
    if (filter === "branch") search = { branchId: branchId, engineerId: null };
    if (filter === "engineer") search = { engineerId: { in: engineers } };
    if (filter === "engineer" && engineers.length <= 0)
      search = { branchId, engineerId: { not: null } };
    if (!filter) search = { branchId };

    // get job entry list
    const result = await prisma.job.findMany({
      where: {
        AND: [search],
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        items: { include: { skuCode: { include: { item: true } } } },
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
    console.log(err);
    res.status(400).send(err);
  }
};

export default { create, jobList };
