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
        id: true,
        item: {
          select: {
            name: true,
            uom: true,
            id: true,
            model: {
              select: {
                name: true,
                id: true,
                category: {
                  select: { name: true, id: true },
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
    const scrap = await prisma.scrapItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCodeId: skuId,
        scrap: { branchId: branchId, from: "defective" },
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

    // receive faulty
    const received = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "faulty",
        receiverId: branchId,
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

    if (received?._sum?.quantity) quantity += received._sum.quantity;

    return quantity;
  } catch (err: any) {
    throw new Error(err);
  }
};

// get branch stock by sku id
const branchStockBySkuId = async (branchId: string, skuId: string) => {
  try {
    let quantity: number = 0;

    // entry stock
    const entry = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { type: "entry", senderId: branchId, skuCodeId: skuId },
    });
    if (entry?._sum?.quantity) quantity += entry._sum.quantity;

    // received stock
    const received = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "transfer",
        receiverId: branchId,
        skuCodeId: skuId,
        status: "received",
      },
    });
    if (received?._sum?.quantity) quantity += received._sum.quantity;

    // transfer stock
    const transfer = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "transfer",
        senderId: branchId,
        skuCodeId: skuId,
        status: { in: ["open", "approved", "received"] },
      },
    });
    if (transfer?._sum?.quantity) quantity -= transfer._sum.quantity;

    // faulty return stock
    const faultyRe = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: {
        type: "faulty",
        senderId: branchId,
        skuCodeId: skuId,
        status: { in: ["open", "received"] },
      },
    });
    if (faultyRe?._sum?.quantity) quantity -= faultyRe._sum.quantity;

    // from faulty
    const faultyGood = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { senderId: branchId, skuCodeId: skuId, type: "fromFaulty" },
    });
    if (faultyGood?._sum?.quantity) quantity += faultyGood._sum.quantity;

    // purchase return
    const puReturn = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { type: "purchaseReturn", senderId: branchId, skuCodeId: skuId },
    });
    if (puReturn?._sum?.quantity) quantity -= puReturn._sum.quantity;

    // engineer transfer
    const engineer = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, type: "transfer", branchId: branchId },
    });
    if (engineer?._sum?.quantity) quantity -= engineer._sum.quantity;

    // engineer return
    const enReturn = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, type: "return", branchId: branchId },
    });
    if (enReturn?._sum?.quantity) quantity += enReturn._sum.quantity;

    const skuCode = await getSku(skuId);
    const avgPrice = await getAvgPrice(skuId);
    const sellQuantity = await getSellQuantity(branchId, skuId);
    const defective = await getBranchDefective(branchId, skuId);
    const faulty = await getFaultyStock(branchId, skuId);

    const result: any = {
      skuCode,
      avgPrice,
      quantity,
      defective,
      faulty,
    };

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
