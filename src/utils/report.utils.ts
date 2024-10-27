import { prisma } from "../server";
import { branchStockBySkuId } from "./stock.utils";

export const agingReportBySku = async (
  branchId: string,
  skuId: string,
  isAdmin: boolean
) => {
  const stock = await branchStockBySkuId(branchId, skuId, isAdmin);
  const arr: any[] = [];
  if (stock?.quantity <= 0) return null;
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
    const quantity = Math.min(stock.quantity, row.quantity);
    arr.push({ ...row, quantity });
    stock.quantity -= quantity;
  }
  return arr;
};
