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
    return avgPrice.toFixed(2);
  } catch (err) {
    throw new Error(err?.message);
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
    throw new Error(err?.message);
  }
};

// get branch stock by sku id
const branchStockBySkuId = async (branchId: string, skuId: string) => {
  try {
    // get sku code by id
    const skuCode = await prisma.skuCode.findUnique({
      where: { id: skuId },
      include: {
        item: {
          select: { name: true, uom: true },
          include: {
            model: {
              select: { name: true },
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const stock = await prisma.$queryRaw`
    SELECT 
        SUM(CASE WHEN type = 'entry' THEN quantity ELSE 0 END ) as entry_quantity,
        SUM(CASE WHEN type = 'transfer' AND senderId = ${branchId}
                AND status IN ( 'open','approved','received' ) 
            THEN quantity ELSE 0 END ) as transfer_quantity,
        SUM(CASE WHEN type = 'transfer' AND receiverId = ${branchId}
                AND status = 'received' 
            THEN quantity ELSE 0 END ) as received_quantity,
        SUM(CASE WHEN type = 'return' AND senderId = ${branchId}
                AND status IN ( 'open','received' ) 
            THEN quantity ELSE 0 END ) as returned_quantity,
        SUM(CASE WHEN type = 'engineer' AND senderId = ${branchId}
                AND status IN ( 'open','received' ) 
            THEN quantity ELSE 0 END ) as engineer_quantity,
    FROM stock
    WHERE ( senderId = ${branchId} OR receiverId = ${branchId} ) 
        AND skuCodeId = ${skuId}
    `;

    const avgPrice = await getAvgPrice(skuId);
    const sellQuantity = await getSellQuantity(branchId, skuId);

    return { skuCode, stock, avgPrice, sellQuantity };
    // // entry count query
    // const entry = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: { senderId: branchId, type: "entry", skuCodeId: skuId },
    // });

    // // received count query
    // const received = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     receiverId: branchId,
    //     type: "transfer",
    //     status: "received",
    //     skuCodeId: skuId,
    //   },
    // });

    // // transfer count query
    // const transfer = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     senderId: branchId,
    //     type: "transfer",
    //     skuCodeId: skuId,
    //     status: { in: ["open", "approved", "received"] },
    //   },
    // });

    // // returned count query
    // const returned = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     senderId: branchId,
    //     type: "return",
    //     skuCodeId: skuId,
    //     status: { in: ["open", "received"] },
    //   },
    // });

    // // engineer send count query
    // const engineer = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     senderId: branchId,
    //     type: "engineer",
    //     skuCodeId: skuId,
    //     status: { in: ["open", "received"] },
    //   },
    // });
  } catch (err) {
    throw new Error("Stock error");
  }
};

export default { branchStockBySkuId };
