import { prisma } from "../server";

type QueryRow = {
  entry: number | null;
  received: number | null;
  transfer: number | null;
  faulty_good: number | null;
  purchase_return: number | null;
  faulty_re: number | null;
  engineer_transfer: number | null;
  engineer_return: number | null;
};

// get average price by sku id
const getAvgPrice = async (skuId: string) => {
  try {
    const totalQuantity = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, type: "entry" },
    });
    const results = await prisma.$queryRaw<
      { totalPrice: number }[]
    >`SELECT SUM(quantity * price) as totalPrice FROM Stock WHERE skuCodeId = ${skuId} AND type = 'entry' `;
    const totalPrice = results.reduce(
      (total, i) => (i.totalPrice ? i.totalPrice + total : total + 0),
      0
    );

    const avgPrice = totalQuantity._sum.quantity
      ? totalPrice / totalQuantity._sum.quantity
      : 0;
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
      where: {
        skuCodeId: skuId,
        job: { branchId: branchId, engineerId: null },
      },
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
    const skuCode = await getSku(skuId);
    if (!skuCode?.isDefective) return quantity;

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
          engineerId: null,
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

    // get engineer send defective
    const enSend = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: {
        branchId: branchId,
        skuCodeId: skuId,
        type: "defective",
        status: "received",
      },
    });

    // defective quantity
    if (defective?._sum?.quantity) quantity += defective._sum.quantity;
    // send defective
    if (send?._sum?.quantity) quantity -= send._sum.quantity;
    // receive defective
    if (receive?._sum?.quantity) quantity += receive._sum.quantity;
    // engineer send defective
    if (enSend?._sum?.quantity) quantity += enSend._sum.quantity;
    // scrap quantity
    if (scrap?._sum?.quantity) quantity -= scrap._sum.quantity;

    return quantity;
  } catch (err: any) {
    throw new Error(err);
  }
};

// get branch faulty stock
export const getFaultyStock = async (
  branchId: string,
  skuId: string,
  isAdmin?: boolean
) => {
  try {
    let quantity = 0;
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
    if (engineer?._sum?.quantity) quantity += engineer._sum.quantity;

    // receive faulty
    const received = await prisma.faulty.aggregate({
      _sum: { quantity: true },
      where: { skuCodeId: skuId, status: "received" },
    });
    if (received?._sum?.quantity && isAdmin) quantity += received._sum.quantity;

    // transfer to good
    const good = await prisma.stock.aggregate({
      _sum: { quantity: true },
      where: { type: "fromFaulty", senderId: branchId, skuCodeId: skuId },
    });
    if (good?._sum?.quantity) quantity -= good._sum.quantity;

    // scrap stock
    const scrap = await prisma.scrapItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCodeId: skuId,
        scrap: { branchId: branchId, from: "faulty" },
      },
    });
    if (scrap?._sum?.quantity) quantity -= scrap._sum.quantity;

    return quantity;
  } catch (err: any) {
    throw new Error(err);
  }
};

// get branch stock by sku id
const branchStockBySkuId = async (
  branchId: string,
  skuId: string,
  isAdmin: boolean = false
) => {
  try {
    let quantity: number = 0;

    const sellQuantity = await getSellQuantity(branchId, skuId);
    const defective = await getBranchDefective(branchId, skuId);
    const faulty = await getFaultyStock(branchId, skuId, isAdmin);
    const skuCode = await getSku(skuId);
    const avgPrice = await getAvgPrice(skuId);

    const rows = await prisma.$queryRaw<QueryRow[]>`SELECT
        (SELECT SUM(s.quantity)
         FROM Stock as s
         WHERE s.type = 'entry'
          AND s.senderId = ${branchId} 
          AND s.skuCodeId = ${skuId}) as entry,
        (SELECT SUM(s.quantity)
         FROM Stock as s
         WHERE s.type = 'transfer'
          AND s.receiverId = ${branchId} 
          AND s.status = 'received'
          AND s.skuCodeId = ${skuId}) as received,
        (SELECT SUM(s.quantity)
         FROM Stock as s
         WHERE s.type = 'transfer'
          AND s.senderId = ${branchId} 
          AND s.status IN ("open", "approved", "received")
          AND s.skuCodeId = ${skuId}) as transfer,
        (SELECT SUM(s.quantity)
         FROM Stock as s
         WHERE s.type = 'fromFaulty' AND s.senderId = ${branchId} AND s.skuCodeId = ${skuId}) as faulty_good,
        (SELECT SUM(s.quantity)
         FROM Stock as s
         WHERE s.type = 'purchaseReturn' AND s.senderId = ${branchId} AND s.skuCodeId = ${skuId}) as purchase_return,
        (SELECT SUM(f.quantity)
         FROM Faulty as f
         WHERE f.branchId = ${branchId} AND f.status IN ("open", "received") AND f.skuCodeId = ${skuId}) as faulty_re,
        (SELECT SUM(en.quantity)
         FROM EngineerStock as en
         WHERE en.branchId = ${branchId} AND en.type = 'transfer' AND en.status IN ("open", "received") AND en.skuCodeId = ${skuId}) as engineer_transfer,
        (SELECT SUM(en.quantity)
         FROM EngineerStock as en
         WHERE en.branchId = ${branchId} AND en.type = 'return' AND en.status = "received" AND en.skuCodeId = ${skuId}) as engineer_return
      `;

    for (const row of rows) {
      const entry = row.entry || 0;
      const received = row.received || 0;
      const transfer = row.transfer || 0;
      const faultyGood = row.faulty_good || 0;
      const purchaseReturn = row.purchase_return || 0;
      const faultyRe = row.faulty_re || 0;
      const engineerTransfer = row.engineer_transfer || 0;
      const engineerReturn = row.engineer_return || 0;
      quantity =
        entry +
        received +
        engineerReturn +
        faultyGood -
        transfer -
        purchaseReturn -
        faultyRe -
        engineerTransfer;
    }
    // minus sell quantity
    if (sellQuantity) quantity -= sellQuantity;
    const result: any = {
      skuCode,
      avgPrice,
      quantity,
      defective,
      faulty,
    };
    result.quantity = parseFloat(result.quantity.toFixed(2));

    // quantity = 0;

    // // entry stock
    // const entry = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: { type: "entry", senderId: branchId, skuCodeId: skuId },
    // });
    // if (entry?._sum?.quantity) quantity += entry._sum.quantity;
    // console.log(`en`, entry._sum.quantity);

    // // received stock
    // const received = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     type: "transfer",
    //     receiverId: branchId,
    //     skuCodeId: skuId,
    //     status: "received",
    //   },
    // });
    // if (received?._sum?.quantity) quantity += received._sum.quantity;
    // console.log(`re`, received._sum.quantity);

    // // transfer stock
    // const transfer = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     type: "transfer",
    //     senderId: branchId,
    //     skuCodeId: skuId,
    //     status: { in: ["open", "approved", "received"] },
    //   },
    // });
    // if (transfer?._sum?.quantity) quantity -= transfer._sum.quantity;
    // console.log(`transfer`, transfer._sum.quantity);

    // // faulty return stock
    // const faultyRe = await prisma.faulty.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     branchId: branchId,
    //     status: { in: ["open", "received"] },
    //     skuCodeId: skuId,
    //   },
    // });
    // if (faultyRe?._sum?.quantity) quantity -= faultyRe._sum.quantity;

    // // from faulty
    // const faultyGood = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: { senderId: branchId, skuCodeId: skuId, type: "fromFaulty" },
    // });
    // if (faultyGood?._sum?.quantity) quantity += faultyGood._sum.quantity;

    // // purchase return
    // const puReturn = await prisma.stock.aggregate({
    //   _sum: { quantity: true },
    //   where: { type: "purchaseReturn", senderId: branchId, skuCodeId: skuId },
    // });
    // if (puReturn?._sum?.quantity) quantity -= puReturn._sum.quantity;
    // console.log(`pureturn`, puReturn._sum.quantity);

    // // engineer transfer
    // const engineer = await prisma.engineerStock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     skuCodeId: skuId,
    //     type: "transfer",
    //     branchId: branchId,
    //     status: { in: ["open", "received"] },
    //   },
    // });
    // if (engineer?._sum?.quantity) quantity -= engineer._sum.quantity;
    // console.log(`en_transfer`, engineer._sum.quantity);

    // // engineer return
    // const enReturn = await prisma.engineerStock.aggregate({
    //   _sum: { quantity: true },
    //   where: {
    //     skuCodeId: skuId,
    //     type: "return",
    //     branchId: branchId,
    //     status: "received",
    //   },
    // });
    // if (enReturn?._sum?.quantity) quantity += enReturn._sum.quantity;
    // console.log(`en_return`, enReturn._sum.quantity);

    // minus sell quantity
    // if (sellQuantity) result.quantity -= sellQuantity;

    return result;
  } catch (err) {
    console.log(err);
    throw new Error("Stock error");
  }
};

// get engineer stock by sku id
const engineerStockBySkuId = async (userId: string, skuId: string) => {
  try {
    let quantity = 0;
    let defectiveQuantity = 0;
    // received stock
    const received = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: {
        engineerId: userId,
        type: "transfer",
        status: "received",
        skuCodeId: skuId,
      },
    });

    // return stock
    const returnStock = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: {
        type: { in: ["return", "faulty"] },
        engineerId: userId,
        skuCodeId: skuId,
        status: { in: ["open", "received"] },
      },
    });

    // job entry item
    const sell = await prisma.jobItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCodeId: skuId,
        job: { engineerId: userId, sellFrom: "engineer" },
      },
    });

    // job entry defective
    const defective = await prisma.jobItem.aggregate({
      _sum: { quantity: true },
      where: {
        skuCodeId: skuId,
        skuCode: { isDefective: true },
        job: { engineerId: userId },
      },
    });
    if (defective._sum.quantity) defectiveQuantity += defective._sum.quantity;

    // send defective item
    const sendDe = await prisma.engineerStock.aggregate({
      _sum: { quantity: true },
      where: {
        engineerId: userId,
        type: "defective",
        skuCodeId: skuId,
        status: { in: ["open", "received"] },
      },
    });
    if (sendDe._sum.quantity) defectiveQuantity -= sendDe._sum.quantity;

    const avgPrice = await getAvgPrice(skuId);
    const skuCode = await getSku(skuId);

    if (received?._sum?.quantity) quantity += received?._sum?.quantity;
    if (returnStock?._sum?.quantity) quantity -= returnStock?._sum?.quantity;

    if (sell?._sum?.quantity) quantity -= sell?._sum?.quantity;

    return { quantity, skuCode, avgPrice, defective: defectiveQuantity };
  } catch (err: any) {
    throw new Error(err);
  }
};

export { branchStockBySkuId, engineerStockBySkuId, getBranchDefective, getSku };
