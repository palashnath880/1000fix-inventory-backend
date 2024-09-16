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
exports.engineerStockBySkuId = exports.branchStockBySkuId = void 0;
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
// get sku code by id
const getSku = (skuId) => __awaiter(void 0, void 0, void 0, function* () {
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
        return skuCode;
    }
    catch (err) {
        throw new Error(err);
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
    var _a, _b, _c, _d;
    try {
        const entry = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { type: "entry", senderId: branchId, skuCodeId: skuId },
        });
        const received = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "transfer",
                receiverId: branchId,
                skuCodeId: skuId,
                status: "received",
            },
        });
        const transfer = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "transfer",
                senderId: branchId,
                skuCodeId: skuId,
                status: { in: ["open", "approved", "received"] },
            },
        });
        const faulty = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                senderId: branchId,
                skuCodeId: skuId,
                status: { in: ["open", "received"] },
            },
        });
        const skuCode = yield getSku(skuId);
        const avgPrice = yield getAvgPrice(skuId);
        const sellQuantity = yield getSellQuantity(branchId, skuId);
        const result = {
            skuCode,
            avgPrice,
            quantity: 0,
        };
        // entry quantity
        if ((_a = entry === null || entry === void 0 ? void 0 : entry._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            result.quantity += entry._sum.quantity;
        // received quantity
        if ((_b = received === null || received === void 0 ? void 0 : received._sum) === null || _b === void 0 ? void 0 : _b.quantity)
            result.quantity += received._sum.quantity;
        // transfer quantity
        if ((_c = transfer === null || transfer === void 0 ? void 0 : transfer._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            result.quantity += transfer._sum.quantity;
        // faulty quantity
        if ((_d = faulty === null || faulty === void 0 ? void 0 : faulty._sum) === null || _d === void 0 ? void 0 : _d.quantity)
            result.quantity += faulty._sum.quantity;
        if (sellQuantity)
            result.quantity -= sellQuantity;
        result.quantity = parseFloat(result.quantity.toFixed(2));
        return result;
    }
    catch (err) {
        throw new Error("Stock error");
    }
});
exports.branchStockBySkuId = branchStockBySkuId;
// get engineer stock by sku id
const engineerStockBySkuId = (userId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const received = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: { engineerId: userId, type: "transfer", status: "received" },
        });
        const sell = yield server_1.prisma.jobItem.aggregate({
            _sum: { quantity: true },
            where: {
                skuCodeId: skuId,
                job: { engineerId: userId, sellFrom: "engineer" },
            },
        });
        const avgPrice = yield getAvgPrice(skuId);
        const skuCode = yield getSku(skuId);
        let quantity = 0;
        if (((_a = received === null || received === void 0 ? void 0 : received._sum) === null || _a === void 0 ? void 0 : _a.quantity) && ((_b = sell === null || sell === void 0 ? void 0 : sell._sum) === null || _b === void 0 ? void 0 : _b.quantity)) {
            quantity = received._sum.quantity - sell._sum.quantity;
        }
        return { quantity, skuCode, avgPrice };
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.engineerStockBySkuId = engineerStockBySkuId;
