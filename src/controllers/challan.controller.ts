import { Request, Response } from "express";
import { prisma } from "../server";
import { generateChallan } from "../utils/challan.utils";

type Challan = {
  challanNo: string;
  name: string;
  phone: string;
  address: string;
  description: string;
  items: { skuCodeId: string; quantity: number }[];
};

// create controller
const create = async (req: Request<{}, {}, Challan>, res: Response) => {
  try {
    const challan = req.body;

    const challanNo = generateChallan();
    if (challanNo) challan.challanNo = `GC-${challanNo}`;

    const result = await prisma.challan.create({
      data: {
        ...challan,
        items: { create: challan.items },
      },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// get by id
const getById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = req.params.id;
    const result = await prisma.challan.findUnique({
      where: { id },
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

// get by date range and challan no
const getAll = async (
  req: Request<{}, {}, {}, { fromDate: string; toDate: string; page: string }>,
  res: Response
) => {
  try {
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;
    const page = parseInt(req.query.page) || 1;

    if (!fromDate || !toDate) {
      return res.send([]);
    }

    const result = await prisma.challan.findMany({
      where: {
        createdAt: { gte: new Date(fromDate), lte: new Date(toDate) },
      },
      skip: (page - 1) * 50,
      take: 50,
      include: { items: { include: { skuCode: true } } },
    });

    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

// delete by id
const deleteChallan = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = req.params.id;

    const result = await prisma.challan.delete({ where: { id } });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create, getById, getAll, deleteChallan };
