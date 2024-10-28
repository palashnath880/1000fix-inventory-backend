import { prisma } from "../server";
import { branchStockBySkuId } from "./stock.utils";

export const agingReportBySku = async (
  branchId: string,
  skuId: string,
  isAdmin: boolean
) => {
  const stock = await branchStockBySkuId(branchId, skuId, isAdmin);
  const now = new Date();
  const obj = {
    "1-60": 0,
    "61-120": 0,
    "121-180": 0,
    "181-240": 0,
    "241-300": 0,
    "301-360": 0,
    "361+": 0,
    quantity: stock.quantity || 0,
  };

  if (stock?.quantity <= 0) return null;

  // get all rows by sku id
  const rows = await prisma.stock.findMany({
    where: {
      OR: [isAdmin ? { senderId: branchId } : { receiverId: branchId }],
      skuCodeId: skuId,
      type: isAdmin ? "entry" : "transfer",
    },
    select: {
      createdAt: true,
      quantity: true,
      type: true,
      skuCodeId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  for (const row of rows) {
    if (!row.quantity) continue;
    const ageInDays = Math.floor(
      (now.getTime() - row.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const quantity = Math.min(stock.quantity, row.quantity);
    if (ageInDays >= 1 && ageInDays <= 60) {
      obj["1-60"] += quantity;
    } else if (ageInDays >= 61 && ageInDays <= 120) {
      obj["61-120"] += quantity;
    } else if (ageInDays >= 121 && ageInDays <= 180) {
      obj["121-180"] += quantity;
    } else if (ageInDays >= 181 && ageInDays <= 240) {
      obj["181-240"] += quantity;
    } else if (ageInDays >= 241 && ageInDays <= 300) {
      obj["241-300"] += quantity;
    } else if (ageInDays >= 301) {
      obj["301-360"] += quantity;
    } else if (ageInDays >= 361) {
      obj["361+"] += quantity;
    }
    stock.quantity -= quantity;
  }
  return obj;
};
