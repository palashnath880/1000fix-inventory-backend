import { Request, Response } from "express";
import { prisma } from "../server";
import { generateChallan } from "../utils/challan.utils";

const create = async (
  req: Request<
    {},
    {},
    {
      challanNo: string;
      branchId: string;
      from: "defective" | "faulty";
      items: { skuCodeId: string; quantity: number }[];
    }
  >,
  res: Response
) => {
  try {
    const data = req.body;
    const challanNo = `SC-${generateChallan()}`;
    data.challanNo = challanNo;
    data.branchId = req.cookies?.user?.branchId;

    const result = await prisma.scrap.create({
      data: {
        ...data,
        items: {
          create: data.items,
        },
      },
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { create };
