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

// get branch defective
const getBranchDefective = async (branchId: string, skuId: string) => {
  try {
    let quantity: number = 0;

    // get generate defective quantity
    const defective = await prisma.jobItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCode: {
          id: skuId,
          isDefective: true,
        },
        job: {
          branchId: branchId,
        },
      },
    });

    // send defective quantity
    const send = await prisma.stockItem.aggregate({
      _sum: { quantity: true },
      where: {
        type: "defective",
        skuCodeId: skuId,
        challan: {
          senderId: branchId,
          status: { in: ["open", "received"] },
        },
      },
    });

    // receive defective quantity
    const receive = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "defective",
        receiverId: branchId,
        skuCodeId: skuId,
        status: "received",
      },
    });

    // scrap quantity
    const scrap = await prisma.stockItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCodeId: skuId,
        challan: { senderId: branchId },
        type: "scrap",
      },
    });

    // defective quantity
    if (defective?._sum?.quantity) quantity += defective._sum.quantity;
    // send defective
    if (send?._sum?.quantity) quantity -= send._sum.quantity;
    // receive defective
    if (receive?._sum?.quantity) quantity += receive._sum.quantity;

    // scrap quantity
    if (scrap?._sum?.quantity) quantity -= scrap._sum.quantity;

    return quantity;
  } catch (err: any) {
    throw new Error(err);
  }
};

// get branch faulty stock
const getFaultyStock = async (branchId: string, skuId: string) => {
  try {
    // engineer faulty stock
    const engineer = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "faulty",
        branchId: branchId,
        status: "received",
        skuCodeId: skuId,
      },
    });

    // transfer to good
    const transfer = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { type: "fromFaulty", senderId: branchId, skuCodeId: skuId },
    });

    let quantity = 0;
    if (engineer?._sum?.quantity) quantity += engineer._sum.quantity;

    if (transfer?._sum?.quantity) quantity -= transfer._sum.quantity;

    return quantity;
  } catch (err: any) {
    throw new Error(err);
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

    const faultyReturn = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "faulty",
        senderId: branchId,
        skuCodeId: skuId,
        status: { in: ["open", "received"] },
      },
    });

    const faultyGood = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { senderId: branchId, skuCodeId: skuId, type: "fromFaulty" },
    });

    // engineer transfer
    const engineer = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, type: "transfer", branchId: branchId },
    });

    // engineer return
    const enReturn = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, type: "return", branchId: branchId },
    });

    const skuCode = await getSku(skuId);
    const avgPrice = await getAvgPrice(skuId);
    const sellQuantity = await getSellQuantity(branchId, skuId);
    const defective = await getBranchDefective(branchId, skuId);
    const faulty = await getFaultyStock(branchId, skuId);

    const result: {
      skuCode: any;
      avgPrice: number;
      quantity: number;
      defective: number;
      faulty: number;
    } = {
      skuCode,
      avgPrice,
      quantity: 0,
      defective,
      faulty,
    };

    // entry quantity
    if (entry?._sum?.quantity) result.quantity += entry._sum.quantity;

    // faulty good quantity
    if (faultyGood?._sum?.quantity) result.quantity += faultyGood._sum.quantity;

    // received quantity
    if (received?._sum?.quantity) result.quantity += received._sum.quantity;

    // transfer quantity
    if (transfer?._sum?.quantity) result.quantity -= transfer._sum.quantity;

    // faulty quantity
    if (faultyReturn?._sum?.quantity)
      result.quantity -= faultyReturn._sum.quantity;

    // engineer transfer quantity
    if (engineer?._sum?.quantity) result.quantity -= engineer._sum.quantity;

    // engineer return good quantity
    if (enReturn?._sum?.quantity) result.quantity += enReturn._sum.quantity;

    // minus sell quantity
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
      where: {
        engineerId: userId,
        type: "transfer",
        status: "received",
        skuCodeId: skuId,
      },
    });

    const returnStock = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: {
        type: { in: ["return", "faulty"] },
        engineerId: userId,
        skuCodeId: skuId,
        status: { in: ["open", "received"] },
      },
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

    if (received?._sum?.quantity) quantity += received?._sum?.quantity;
    if (returnStock?._sum?.quantity) quantity -= returnStock?._sum?.quantity;

    if (sell?._sum?.quantity) quantity -= sell?._sum?.quantity;

    return { quantity, skuCode, avgPrice };
  } catch (err: any) {
    throw new Error(err);
  }
};

export { branchStockBySkuId, engineerStockBySkuId, getBranchDefective };
