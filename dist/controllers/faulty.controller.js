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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const stock_utils_1 = require("../utils/stock.utils");
// send faulty to csc head
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        let list = req.body.list;
        list = list.map((i) => (Object.assign(Object.assign({}, i), { branchId })));
        const result = yield server_1.prisma.faulty.createMany({ data: list });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// faulty stock list
const headFaulty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield server_1.prisma.faulty.findMany({
            where: { status: "open" },
            include: {
                branch: true,
                skuCode: {
                    include: {
                        item: { include: { model: { include: { category: true } } } },
                    },
                },
            },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// faulty stock receive reject
const faultyAction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = req.body;
        data.endAt = moment_timezone_1.default.tz("Asia/Dhaka").toISOString();
        const result = yield server_1.prisma.faulty.update({
            data: data,
            where: { id, status: "open" },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// faulty csc report
const report = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user;
        const branchId = user === null || user === void 0 ? void 0 : user.branchId;
        const fromDate = req.query.fromDate
            ? new Date(req.query.fromDate)
            : new Date();
        const toDate = req.query.toDate
            ? new Date(req.query.toDate)
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));
        // csc general faulty send report
        if ((user === null || user === void 0 ? void 0 : user.role) === "manager") {
            const result = yield server_1.prisma.faulty.findMany({
                where: {
                    branchId: branchId,
                    createdAt: {
                        gte: fromDate,
                        lte: toDate,
                    },
                },
                include: {
                    skuCode: {
                        include: {
                            item: { include: { model: { include: { category: true } } } },
                        },
                    },
                },
            });
            return res.send(result);
        }
        // csc head faulty receive reject report
        const result = yield server_1.prisma.faulty.findMany({
            where: {
                status: { in: ["received", "rejected"] },
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            include: {
                branch: true,
                skuCode: {
                    include: {
                        item: { include: { model: { include: { category: true } } } },
                    },
                },
            },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// own faulty stock
const ownFaulty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const skuId = req.query.skuId;
        const user = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user;
        const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === "admin";
        const stockArr = [];
        const skuCodes = yield server_1.prisma.skuCode.findMany({
            where: skuId ? { id: skuId } : {},
            orderBy: [{ item: { model: { category: { name: "asc" } } } }],
            include: {
                item: { include: { model: { include: { category: true } } } },
            },
        });
        for (const skuCode of skuCodes) {
            const stock = yield (0, stock_utils_1.getFaultyStock)(user === null || user === void 0 ? void 0 : user.branchId, skuCode.id, isAdmin);
            if (stock > 0) {
                stockArr.push({ skuCode, faulty: stock });
            }
        }
        res.send(stockArr);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = {
    create,
    faultyAction,
    report,
    headFaulty,
    ownFaulty,
};
