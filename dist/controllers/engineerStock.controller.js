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
// transfer to engineer
const transfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const stock = req.body.list;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const list = stock.map((i) => (Object.assign(Object.assign({}, i), { branchId })));
        const result = yield server_1.prisma.engineerStock.createMany({ data: list });
        res.status(201).send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// branch transfer report
const brTrReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const role = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.role;
        const branchId = (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.branchId;
        const engineerId = req.query.userId;
        let fromDate = req.query.fromDate;
        fromDate = fromDate ? new Date(fromDate) : new Date();
        let toDate = req.query.toDate;
        toDate = toDate
            ? new Date(toDate)
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").format("YYYY-MM-DD"));
        const result = yield server_1.prisma.engineerStock.findMany({
            where: {
                AND: [
                    engineerId ? { engineerId } : {},
                    {
                        createdAt: {
                            gte: fromDate,
                            lte: toDate,
                        },
                    },
                    role === "admin" ? {} : { branchId },
                ],
            },
            include: {
                engineer: true,
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
// receive stock list
const receive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const result = yield server_1.prisma.engineerStock.findMany({
            where: { engineerId: userId, status: "open", type: "transfer" },
            orderBy: {
                createdAt: "asc",
            },
            include: {
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
// status handler
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.stockId;
        const data = req.body;
        data.endAt = moment_timezone_1.default.tz("Asia/Dhaka").toISOString();
        const result = yield server_1.prisma.engineerStock.update({
            where: { id },
            data: data,
        });
        res.send(result);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});
// own stock
const ownStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const userId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const category = (_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.category;
        const model = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.model;
        const skuCode = (_e = req === null || req === void 0 ? void 0 : req.query) === null || _e === void 0 ? void 0 : _e.skuId;
        const stockArr = [];
        const skuCodes = yield server_1.prisma.skuCode.findMany({
            where: skuCode
                ? { id: skuCode }
                : model
                    ? { item: { modelId: model } }
                    : category
                        ? { item: { model: { categoryId: category } } }
                        : {},
            select: {
                id: true,
            },
        });
        for (const skuId of skuCodes) {
            const stock = yield (0, stock_utils_1.engineerStockBySkuId)(userId, skuId.id);
            if (stock.quantity) {
                stock && stockArr.push(stock);
            }
        }
        res.send(stockArr);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
//  stock return
const stockReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const data = req.body.list;
        const engineerId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const branchId = (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.branchId;
        const list = data.map((i) => (Object.assign(Object.assign({}, i), { engineerId: engineerId, type: "return", branchId: branchId })));
        const result = yield server_1.prisma.engineerStock.createMany({ data: list });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// faulty stock return
const faultyReturn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const data = req.body.list;
        const engineerId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const branchId = (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.branchId;
        const list = data.map((i) => (Object.assign(Object.assign({}, i), { engineerId: engineerId, type: "faulty", branchId: branchId })));
        const result = yield server_1.prisma.engineerStock.createMany({ data: list });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// return faulty and good stock by branch
const stockByBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const type = req.params.type;
        const result = yield server_1.prisma.engineerStock.findMany({
            where: { branchId: branchId, status: "open", type: type },
            include: {
                engineer: true,
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
// stock transfer report
const stockReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const engineerId = req.params.userId;
        const fromDate = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.fromDate) ? new Date(req.query.fromDate) : "";
        const toDate = ((_b = req.query) === null || _b === void 0 ? void 0 : _b.toDate) ? new Date(req.query.toDate) : "";
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const result = yield server_1.prisma.engineerStock.findMany({
            where: {
                engineerId: engineerId,
                type: "transfer",
                status: { in: ["received", "rejected"] },
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
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock faulty and stock return report
const report = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const engineerId = req.params.userId;
        const fromDate = ((_a = req.query) === null || _a === void 0 ? void 0 : _a.fromDate) ? new Date(req.query.fromDate) : "";
        const toDate = ((_b = req.query) === null || _b === void 0 ? void 0 : _b.toDate) ? new Date(req.query.toDate) : "";
        const type = ((_c = req.query) === null || _c === void 0 ? void 0 : _c.type) || "return";
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const result = yield server_1.prisma.engineerStock.findMany({
            where: {
                engineerId: engineerId,
                type: type,
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
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// engineer stock by sku id
const stockBySkuId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const skuId = req.params.skuId;
        const stock = yield (0, stock_utils_1.engineerStockBySkuId)(userId, skuId);
        res.send(stock);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// get stock by engineer
const getByEngineer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const model = req.query.model;
        const category = req.query.category;
        const sku = req.query.sku;
        const stockArr = [];
        const skuCodes = yield server_1.prisma.skuCode.findMany({
            where: sku
                ? { id: sku }
                : model
                    ? { item: { modelId: model } }
                    : category
                        ? { item: { model: { categoryId: category } } }
                        : {},
            select: {
                id: true,
            },
        });
        const engineer = yield server_1.prisma.user.findUnique({ where: { id } });
        for (const skuCode of skuCodes) {
            const stock = yield (0, stock_utils_1.engineerStockBySkuId)(id, skuCode.id);
            if (stock.quantity > 0) {
                stockArr.push(Object.assign(Object.assign({}, stock), { engineer }));
            }
        }
        res.send(stockArr);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// send defective to branch
const sendDefective = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const data = req.body;
        data.engineerId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        data.branchId = (_d = (_c = req.cookies) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.branchId;
        data.type = "defective";
        const result = yield server_1.prisma.engineerStock.create({ data });
        return res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = {
    transfer,
    receive,
    update,
    ownStock,
    stockBySkuId,
    faultyReturn,
    report,
    stockReport,
    stockReturn,
    stockByBranch,
    getByEngineer,
    brTrReport,
    sendDefective,
};
