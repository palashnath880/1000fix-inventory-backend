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
// stock entry
const entry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const newStock = req.body;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        newStock.senderId = branchId;
        newStock.type = "entry";
        // insert stock
        const result = yield server_1.prisma.stock.create({ data: newStock });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock entry list
const entryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const list = yield server_1.prisma.stock.findMany({
            where: {
                type: "entry",
                createdAt: { gte: fromDate, lte: toDate },
            },
        });
        return list;
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock transfer
const transfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        let list = req.body.transferList;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const role = (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.role;
        const newList = list.map((item) => {
            item.senderId = branchId;
            item.type = "transfer";
            if (role === "admin") {
                item.status = "approved";
            }
            else {
                item.status = "open";
            }
            return item;
        });
        const result = yield server_1.prisma.stock.createMany({ data: newList });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
//  engineer stock transfer
const transferToEngineer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let list = req.body.transferList;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const newList = list.map((item) => {
            item.senderId = branchId;
            item.type = "engineer";
            item.status = "open";
            return item;
        });
        const result = yield server_1.prisma.stock.createMany({ data: newList });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock entry list
const transferList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const branchId = req.params.branchId;
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const list = yield server_1.prisma.stock.findMany({
            where: {
                type: "transfer",
                senderId: branchId,
                createdAt: { gte: fromDate, lte: toDate },
            },
        });
        return list;
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { entry, transfer, entryList, transferList, transferToEngineer };
