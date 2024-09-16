import { prisma } from "../server";

// get average price by sku id
const getAvgPrice = async (skuId: string) => {
  try {
    const rows = await prisma.stock.findMany({
      where: { skuCodeId: skuId, type: "entry" },
      select: {
        price: true,
      },
      distinct: ["price"],
    });

    const prices: number[] = [];
    rows.forEach((item) => {
      if (item?.price) {
        prices.push(item.price);
      }
    });

    const total = prices.reduce(
      (totalValue, newValue) => totalValue + newValue,
      0
    );
    const avgPrice = total / prices.length;
    return parseFloat(avgPrice.toFixed(2));
  } catch (err) {
    throw new Error("error form the getAvgPrice function");
  }
};

// get sku code by id
const getSku = async (skuId: string) => {
  try {
    // get sku code by id
    const skuCode = await prisma.skuCode.findUnique({
      where: { id: skuId },
      select: {
        name: true,
        isDefective: true,
        item: {
          select: {
            name: true,
            uom: true,
            model: {
              select: {
                name: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });
    return skuCode;
  } catch (err: any) {
    throw new Error(err);
  }
};

// get sell quantity
const getSellQuantity = async (branchId: string, skuId: string) => {
  try {
    const rows = await prisma.jobItem.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, job: { branchId: branchId } },
    });

    return rows._sum.quantity || 0;
  } catch (err) {
    throw new Error("error from getSellQuantity function");
  }
};

// get branch stock by sku id
const branchStockBySkuId = async (branchId: string, skuId: string) => {
  try {
    const entry = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { type: "entry", senderId: branchId, skuCodeId: skuId },
    });

    const received = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "transfer",
        receiverId: branchId,
        skuCodeId: skuId,
        status: "received",
      },
    });

    const transfer = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "transfer",
        senderId: branchId,
        skuCodeId: skuId,
        status: { in: ["open", "approved", "received"] },
      },
    });

    const faulty = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        senderId: branchId,
        skuCodeId: skuId,
        status: { in: ["open", "received"] },
      },
    });

    const skuCode = await getSku(skuId);
    const avgPrice = await getAvgPrice(skuId);
    const sellQuantity = await getSellQuantity(branchId, skuId);

    const result: { skuCode: any; avgPrice: number; quantity: number } = {
      skuCode,
      avgPrice,
      quantity: 0,
    };

    // entry quantity
    if (entry?._sum?.quantity) result.quantity += entry._sum.quantity;

    // received quantity
    if (received?._sum?.quantity) result.quantity += received._sum.quantity;

    // transfer quantity
    if (transfer?._sum?.quantity) result.quantity += transfer._sum.quantity;

    // faulty quantity
    if (faulty?._sum?.quantity) result.quantity += faulty._sum.quantity;

    if (sellQuantity) result.quantity -= sellQuantity;

    result.quantity = parseFloat(result.quantity.toFixed(2));

    return result;
  } catch (err) {
    throw new Error("Stock error");
  }
};

// get engineer stock by sku id
const engineerStockBySkuId = async (userId: string, skuId: string) => {
  try {
    const received = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: { engineerId: userId, type: "transfer", status: "received" },
    });

    const sell = await prisma.jobItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCodeId: skuId,
        job: { engineerId: userId, sellFrom: "engineer" },
      },
    });

    const avgPrice = await getAvgPrice(skuId);
    const skuCode = await getSku(skuId);
    let quantity = 0;
    if (received?._sum?.quantity && sell?._sum?.quantity) {
      quantity = received._sum.quantity - sell._sum.quantity;
    }

    return { quantity, skuCode, avgPrice };
  } catch (err: any) {
    throw new Error(err);
  }
};

export { branchStockBySkuId, engineerStockBySkuId };
