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

    const stock: {}[] = await prisma.$queryRaw`
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
            THEN quantity ELSE 0 END ) as engineer_quantity
    FROM stock
    WHERE ( senderId = ${branchId} OR receiverId = ${branchId} ) 
        AND skuCodeId = ${skuId}
    `;

    const avgPrice = await getAvgPrice(skuId);
    const sellQuantity = await getSellQuantity(branchId, skuId);

    let result = { skuCode, avgPrice, quantity: 0 };
    if (Array.isArray(stock) && stock?.length > 0) {
      const stockObj: any = stock[0];
      const entry_quantity = stockObj?.entry_quantity || 0;
      const engineer_quantity = stockObj?.engineer_quantity || 0;
      const received_quantity = stockObj?.received_quantity || 0;
      const returned_quantity = stockObj?.returned_quantity || 0;
      const transfer_quantity = stockObj?.transfer_quantity || 0;

      const quantity =
        entry_quantity +
        received_quantity -
        (engineer_quantity +
          returned_quantity +
          transfer_quantity +
          sellQuantity);

      result = { ...result, quantity: parseFloat(quantity.toFixed(2)) };
    }

    return result;
  } catch (err) {
    throw new Error("Stock error");
  }
};

export { branchStockBySkuId };
