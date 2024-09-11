"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
// get average price by sku id
const getAvgPrice = (skuId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield server_1.prisma.stock.findMany({
            where: { skuCodeId: skuId, type: "entry" },
            select: {
                price: true,
            },
            distinct: ["price"],
        });
        const prices = [];
        rows.forEach((item) => {
            if (item === null || item === void 0 ? void 0 : item.price) {
                prices.push(item.price);
            }
        });
        const total = prices.reduce((totalValue, newValue) => totalValue + newValue, 0);
        const avgPrice = total / prices.length;
        return avgPrice.toFixed(2);
    }
    catch (err) {
        throw new Error(err === null || err === void 0 ? void 0 : err.message);
    }
});
// get sell quantity
const getSellQuantity = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield server_1.prisma.jobItem.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, job: { branchId: branchId } },
        });
        return rows._sum.quantity || 0;
    }
    catch (err) {
        throw new Error(err === null || err === void 0 ? void 0 : err.message);
    }
});
// get branch stock by sku id
const branchStockBySkuId = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get sku code by id
        const skuCode = yield server_1.prisma.skuCode.findUnique({
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
        const stock = yield server_1.prisma.$queryRaw `
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
        const avgPrice = yield getAvgPrice(skuId);
        const sellQuantity = yield getSellQuantity(branchId, skuId);
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
    }
    catch (err) {
        throw new Error("Stock error");
    }
});
exports.default = { branchStockBySkuId };
