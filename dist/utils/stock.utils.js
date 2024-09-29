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
            where: {
                skuCodeId: skuId,
                job: { branchId: branchId, engineerId: null },
            },
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
                    engineerId: null,
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
        const scrap = yield server_1.prisma.scrapItem.aggregate({
            _sum: { quantity: true },
            where: {
                skuCodeId: skuId,
                scrap: { branchId: branchId, from: "defective" },
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
    var _a, _b, _c, _d;
    try {
        let quantity = 0;
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
        if ((_a = engineer === null || engineer === void 0 ? void 0 : engineer._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            quantity += engineer._sum.quantity;
        // receive faulty
        const received = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "faulty",
                receiverId: branchId,
                status: "received",
                skuCodeId: skuId,
            },
        });
        if ((_b = received === null || received === void 0 ? void 0 : received._sum) === null || _b === void 0 ? void 0 : _b.quantity)
            quantity += received._sum.quantity;
        // transfer to good
        const good = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { type: "fromFaulty", senderId: branchId, skuCodeId: skuId },
        });
        if ((_c = good === null || good === void 0 ? void 0 : good._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            quantity -= good._sum.quantity;
        // scrap stock
        const scrap = yield server_1.prisma.scrapItem.aggregate({
            _sum: { quantity: true },
            where: {
                skuCodeId: skuId,
                scrap: { branchId: branchId, from: "faulty" },
            },
        });
        if ((_d = scrap === null || scrap === void 0 ? void 0 : scrap._sum) === null || _d === void 0 ? void 0 : _d.quantity)
            quantity -= scrap._sum.quantity;
        return quantity;
    }
    catch (err) {
        throw new Error(err);
    }
});
// get branch stock by sku id
const branchStockBySkuId = (branchId, skuId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        let quantity = 0;
        // entry stock
        const entry = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { type: "entry", senderId: branchId, skuCodeId: skuId },
        });
        if ((_a = entry === null || entry === void 0 ? void 0 : entry._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            quantity += entry._sum.quantity;
        // received stock
        const received = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "transfer",
                receiverId: branchId,
                skuCodeId: skuId,
                status: "received",
            },
        });
        if ((_b = received === null || received === void 0 ? void 0 : received._sum) === null || _b === void 0 ? void 0 : _b.quantity)
            quantity += received._sum.quantity;
        // transfer stock
        const transfer = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "transfer",
                senderId: branchId,
                skuCodeId: skuId,
                status: { in: ["open", "approved", "received"] },
            },
        });
        if ((_c = transfer === null || transfer === void 0 ? void 0 : transfer._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            quantity -= transfer._sum.quantity;
        // faulty return stock
        const faultyRe = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: {
                type: "faulty",
                senderId: branchId,
                skuCodeId: skuId,
                status: { in: ["open", "received"] },
            },
        });
        if ((_d = faultyRe === null || faultyRe === void 0 ? void 0 : faultyRe._sum) === null || _d === void 0 ? void 0 : _d.quantity)
            quantity -= faultyRe._sum.quantity;
        // from faulty
        const faultyGood = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { senderId: branchId, skuCodeId: skuId, type: "fromFaulty" },
        });
        if ((_e = faultyGood === null || faultyGood === void 0 ? void 0 : faultyGood._sum) === null || _e === void 0 ? void 0 : _e.quantity)
            quantity += faultyGood._sum.quantity;
        // purchase return
        const puReturn = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { type: "purchaseReturn", senderId: branchId, skuCodeId: skuId },
        });
        if ((_f = puReturn === null || puReturn === void 0 ? void 0 : puReturn._sum) === null || _f === void 0 ? void 0 : _f.quantity)
            quantity -= puReturn._sum.quantity;
        // engineer transfer
        const engineer = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, type: "transfer", branchId: branchId },
        });
        if ((_g = engineer === null || engineer === void 0 ? void 0 : engineer._sum) === null || _g === void 0 ? void 0 : _g.quantity)
            quantity -= engineer._sum.quantity;
        // engineer return
        const enReturn = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, type: "return", branchId: branchId },
        });
        if ((_h = enReturn === null || enReturn === void 0 ? void 0 : enReturn._sum) === null || _h === void 0 ? void 0 : _h.quantity)
            quantity += enReturn._sum.quantity;
        const skuCode = yield getSku(skuId);
        const avgPrice = yield getAvgPrice(skuId);
        const sellQuantity = yield getSellQuantity(branchId, skuId);
        const defective = yield getBranchDefective(branchId, skuId);
        const faulty = yield getFaultyStock(branchId, skuId);
        const result = {
            skuCode,
            avgPrice,
            quantity,
            defective,
            faulty,
        };
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
        let quantity = 0;
        let defectiveQuantity = 0;
        // received stock
        const received = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                engineerId: userId,
                type: "transfer",
                status: "received",
                skuCodeId: skuId,
            },
        });
        // return stock
        const returnStock = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                type: { in: ["return", "faulty"] },
                engineerId: userId,
                skuCodeId: skuId,
                status: { in: ["open", "received"] },
            },
        });
        // job entry item
        const sell = yield server_1.prisma.jobItem.aggregate({
            _sum: { quantity: true },
            where: {
                skuCodeId: skuId,
                job: { engineerId: userId, sellFrom: "engineer" },
            },
        });
        // job entry defective
        const defective = yield server_1.prisma.jobItem.aggregate({
            _sum: { quantity: true },
            where: {
                skuCodeId: skuId,
                skuCode: { isDefective: true },
                job: { engineerId: userId },
            },
        });
        if (defective._sum.quantity)
            defectiveQuantity += defective._sum.quantity;
        // send defective item
        const sendDe = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                engineerId: userId,
                type: "defective",
                skuCodeId: skuId,
                status: { in: ["open", "received"] },
            },
        });
        if (sendDe._sum.quantity)
            defectiveQuantity -= sendDe._sum.quantity;
        const avgPrice = yield getAvgPrice(skuId);
        const skuCode = yield getSku(skuId);
        if ((_a = received === null || received === void 0 ? void 0 : received._sum) === null || _a === void 0 ? void 0 : _a.quantity)
            quantity += (_b = received === null || received === void 0 ? void 0 : received._sum) === null || _b === void 0 ? void 0 : _b.quantity;
        if ((_c = returnStock === null || returnStock === void 0 ? void 0 : returnStock._sum) === null || _c === void 0 ? void 0 : _c.quantity)
            quantity -= (_d = returnStock === null || returnStock === void 0 ? void 0 : returnStock._sum) === null || _d === void 0 ? void 0 : _d.quantity;
        if ((_e = sell === null || sell === void 0 ? void 0 : sell._sum) === null || _e === void 0 ? void 0 : _e.quantity)
            quantity -= (_f = sell === null || sell === void 0 ? void 0 : sell._sum) === null || _f === void 0 ? void 0 : _f.quantity;
        return { quantity, skuCode, avgPrice, defective: defectiveQuantity };
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.engineerStockBySkuId = engineerStockBySkuId;
