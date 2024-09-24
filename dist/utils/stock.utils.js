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
exports.getBranchDefective = exports.engineerStockBySkuId = exports.branchStockBySkuId = void 0;
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
// get branch defective
const getBranchDefective = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        let quantity = 0;
        // get generate defective quantity
        const defective = yield server_1.prisma.jobItem.aggregate({
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
        const send = yield server_1.prisma.stockItem.aggregate({
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
        const receive = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "defective",
                receiverId: branchId,
                skuCodeId: skuId,
                status: "received",
            },
        });
        // scrap quantity
        const scrap = yield server_1.prisma.stockItem.aggregate({
            _sum: { quantity: true },
            where: {
                skuCodeId: skuId,
                challan: { senderId: branchId },
                type: "scrap",
            },
        });
        // defective quantity
        if ((_a = defective === null || defective === void 0 ? void 0 : defective._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            quantity += defective._sum.quantity;
        // send defective
        if ((_b = send === null || send === void 0 ? void 0 : send._sum) === null || _b === void 0 ? void 0 : _b.quantity)
            quantity -= send._sum.quantity;
        // receive defective
        if ((_c = receive === null || receive === void 0 ? void 0 : receive._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            quantity += receive._sum.quantity;
        // scrap quantity
        if ((_d = scrap === null || scrap === void 0 ? void 0 : scrap._sum) === null || _d === void 0 ? void 0 : _d.quantity)
            quantity -= scrap._sum.quantity;
        return quantity;
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.getBranchDefective = getBranchDefective;
// get branch faulty stock
const getFaultyStock = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // engineer faulty stock
        const engineer = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "faulty",
                branchId: branchId,
                status: "received",
                skuCodeId: skuId,
            },
        });
        // transfer to good
        const transfer = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { type: "fromFaulty", senderId: branchId, skuCodeId: skuId },
        });
        let quantity = 0;
        if ((_a = engineer === null || engineer === void 0 ? void 0 : engineer._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            quantity += engineer._sum.quantity;
        if ((_b = transfer === null || transfer === void 0 ? void 0 : transfer._sum) === null || _b === void 0 ? void 0 : _b.quantity)
            quantity -= transfer._sum.quantity;
        return quantity;
    }
    catch (err) {
        throw new Error(err);
    }
});
// get branch stock by sku id
const branchStockBySkuId = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
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
        const faultyReturn = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "faulty",
                senderId: branchId,
                skuCodeId: skuId,
                status: { in: ["open", "received"] },
            },
        });
        const faultyGood = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { senderId: branchId, skuCodeId: skuId, type: "fromFaulty" },
        });
        // engineer transfer
        const engineer = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, type: "transfer", branchId: branchId },
        });
        // engineer return
        const enReturn = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, type: "return", branchId: branchId },
        });
        const skuCode = yield getSku(skuId);
        const avgPrice = yield getAvgPrice(skuId);
        const sellQuantity = yield getSellQuantity(branchId, skuId);
        const defective = yield getBranchDefective(branchId, skuId);
        const faulty = yield getFaultyStock(branchId, skuId);
        const result = {
            skuCode,
            avgPrice,
            quantity: 0,
            defective,
            faulty,
        };
        // entry quantity
        if ((_a = entry === null || entry === void 0 ? void 0 : entry._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            result.quantity += entry._sum.quantity;
        // faulty good quantity
        if ((_b = faultyGood === null || faultyGood === void 0 ? void 0 : faultyGood._sum) === null || _b === void 0 ? void 0 : _b.quantity)
            result.quantity += faultyGood._sum.quantity;
        // received quantity
        if ((_c = received === null || received === void 0 ? void 0 : received._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            result.quantity += received._sum.quantity;
        // transfer quantity
        if ((_d = transfer === null || transfer === void 0 ? void 0 : transfer._sum) === null || _d === void 0 ? void 0 : _d.quantity)
            result.quantity -= transfer._sum.quantity;
        // faulty quantity
        if ((_e = faultyReturn === null || faultyReturn === void 0 ? void 0 : faultyReturn._sum) === null || _e === void 0 ? void 0 : _e.quantity)
            result.quantity -= faultyReturn._sum.quantity;
        // engineer transfer quantity
        if ((_f = engineer === null || engineer === void 0 ? void 0 : engineer._sum) === null || _f === void 0 ? void 0 : _f.quantity)
            result.quantity -= engineer._sum.quantity;
        // engineer return good quantity
        if ((_g = enReturn === null || enReturn === void 0 ? void 0 : enReturn._sum) === null || _g === void 0 ? void 0 : _g.quantity)
            result.quantity += enReturn._sum.quantity;
        // minus sell quantity
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
    var _a, _b, _c, _d, _e, _f;
    try {
        const received = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                engineerId: userId,
                type: "transfer",
                status: "received",
                skuCodeId: skuId,
            },
        });
        const returnStock = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                type: { in: ["return", "faulty"] },
                engineerId: userId,
                skuCodeId: skuId,
                status: { in: ["open", "received"] },
            },
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
        if ((_a = received === null || received === void 0 ? void 0 : received._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            quantity += (_b = received === null || received === void 0 ? void 0 : received._sum) === null || _b === void 0 ? void 0 : _b.quantity;
        if ((_c = returnStock === null || returnStock === void 0 ? void 0 : returnStock._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            quantity -= (_d = returnStock === null || returnStock === void 0 ? void 0 : returnStock._sum) === null || _d === void 0 ? void 0 : _d.quantity;
        if ((_e = sell === null || sell === void 0 ? void 0 : sell._sum) === null || _e === void 0 ? void 0 : _e.quantity)
            quantity -= (_f = sell === null || sell === void 0 ? void 0 : sell._sum) === null || _f === void 0 ? void 0 : _f.quantity;
        return { quantity, skuCode, avgPrice };
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.engineerStockBySkuId = engineerStockBySkuId;
