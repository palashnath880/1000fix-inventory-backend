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
exports.branchStockBySkuId = void 0;
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
        return parseFloat(avgPrice.toFixed(2));
    }
    catch (err) {
        throw new Error("error form the getAvgPrice function");
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
        throw new Error("error from getSellQuantity function");
    }
});
// get branch stock by sku id
const branchStockBySkuId = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get sku code by id
        const skuCode = yield server_1.prisma.skuCode.findUnique({
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
            THEN quantity ELSE 0 END ) as engineer_quantity
    FROM stock
    WHERE ( senderId = ${branchId} OR receiverId = ${branchId} ) 
        AND skuCodeId = ${skuId}
    `;
        const avgPrice = yield getAvgPrice(skuId);
        const sellQuantity = yield getSellQuantity(branchId, skuId);
        let result = { skuCode, avgPrice, quantity: 0 };
        if (Array.isArray(stock) && (stock === null || stock === void 0 ? void 0 : stock.length) > 0) {
            const stockObj = stock[0];
            const entry_quantity = (stockObj === null || stockObj === void 0 ? void 0 : stockObj.entry_quantity) || 0;
            const engineer_quantity = (stockObj === null || stockObj === void 0 ? void 0 : stockObj.engineer_quantity) || 0;
            const received_quantity = (stockObj === null || stockObj === void 0 ? void 0 : stockObj.received_quantity) || 0;
            const returned_quantity = (stockObj === null || stockObj === void 0 ? void 0 : stockObj.returned_quantity) || 0;
            const transfer_quantity = (stockObj === null || stockObj === void 0 ? void 0 : stockObj.transfer_quantity) || 0;
            const quantity = entry_quantity +
                received_quantity -
                (engineer_quantity +
                    returned_quantity +
                    transfer_quantity +
                    sellQuantity);
            result = Object.assign(Object.assign({}, result), { quantity });
        }
        return result;
    }
    catch (err) {
        console.log(err);
        throw new Error("Stock error");
    }
});
exports.branchStockBySkuId = branchStockBySkuId;
