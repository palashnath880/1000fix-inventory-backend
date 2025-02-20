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
exports.getSku = exports.getBranchDefective = exports.engineerStockBySkuId = exports.branchStockBySkuId = exports.getFaultyStock = void 0;
const server_1 = require("../server");
// get average price by sku id
const getAvgPrice = (skuId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalQuantity = yield server_1.prisma.stock.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, type: "entry" },
        });
        const results = yield server_1.prisma.$queryRaw `SELECT SUM(quantity * price) as totalPrice FROM Stock WHERE skuCodeId = ${skuId} AND type = 'entry' `;
        const totalPrice = results.reduce((total, i) => (i.totalPrice ? i.totalPrice + total : total + 0), 0);
        const avgPrice = totalQuantity._sum.quantity
            ? totalPrice / totalQuantity._sum.quantity
            : 0;
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
exports.getSku = getSku;
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
    var _a, _b, _c, _d, _e;
    try {
        let quantity = 0;
        const skuCode = yield getSku(skuId);
        if (!(skuCode === null || skuCode === void 0 ? void 0 : skuCode.isDefective))
            return quantity;
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
        // get engineer send defective
        const enSend = yield server_1.prisma.engineerStock.aggregate({
            _sum: { quantity: true },
            where: {
                branchId: branchId,
                skuCodeId: skuId,
                type: "defective",
                status: "received",
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
        // engineer send defective
        if ((_d = enSend === null || enSend === void 0 ? void 0 : enSend._sum) === null || _d === void 0 ? void 0 : _d.quantity)
            quantity += enSend._sum.quantity;
        // scrap quantity
        if ((_e = scrap === null || scrap === void 0 ? void 0 : scrap._sum) === null || _e === void 0 ? void 0 : _e.quantity)
            quantity -= scrap._sum.quantity;
        return quantity;
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.getBranchDefective = getBranchDefective;
// get branch faulty stock
const getFaultyStock = (branchId, skuId, isAdmin) => __awaiter(void 0, void 0, void 0, function* () {
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
        const received = yield server_1.prisma.faulty.aggregate({
            _sum: { quantity: true },
            where: { skuCodeId: skuId, status: "received" },
        });
        if (((_b = received === null || received === void 0 ? void 0 : received._sum) === null || _b === void 0 ? void 0 : _b.quantity) && isAdmin)
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
exports.getFaultyStock = getFaultyStock;
// get branch stock by sku id
const branchStockBySkuId = (branchId_1, skuId_1, ...args_1) => __awaiter(void 0, [branchId_1, skuId_1, ...args_1], void 0, function* (branchId, skuId, isAdmin = false) {
    try {
        let quantity = 0;
        const sellQuantity = yield getSellQuantity(branchId, skuId);
        const defective = yield getBranchDefective(branchId, skuId);
        const faulty = yield (0, exports.getFaultyStock)(branchId, skuId, isAdmin);
        const skuCode = yield getSku(skuId);
        const avgPrice = yield getAvgPrice(skuId);
        const rows = yield server_1.prisma.$queryRaw `SELECT
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
        if (sellQuantity)
            quantity -= sellQuantity;
        const result = {
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
    }
    catch (err) {
        console.log(err);
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
                skuCode: { isDefective: true, id: skuId },
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
        return {
            quantity,
            skuCode,
            avgPrice,
            defective: defectiveQuantity,
            meta: { sell, defective, sendDe },
        };
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.engineerStockBySkuId = engineerStockBySkuId;
