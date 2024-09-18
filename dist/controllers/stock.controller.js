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
const stock_utils_1 = require("../utils/stock.utils");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const challan_utils_1 = require("../utils/challan.utils");
// stock entry
const entry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const body = req.body;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const data = (_c = body.list) === null || _c === void 0 ? void 0 : _c.map((i) => {
            i.senderId = branchId;
            i.type = "entry";
            return i;
        });
        // insert stock
        const result = yield server_1.prisma.stock.createMany({
            data: data,
            skipDuplicates: true,
        });
        res.send(result);
    }
    catch (err) {
        console.log(err);
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
                createdAt: { gte: new Date(fromDate), lte: new Date(toDate) },
            },
            select: {
                price: true,
                createdAt: true,
                quantity: true,
                id: true,
                skuCode: {
                    select: {
                        name: true,
                        isDefective: true,
                        item: {
                            select: {
                                name: true,
                                uom: true,
                                model: {
                                    select: { name: true, category: { select: { name: true } } },
                                },
                            },
                        },
                    },
                },
            },
        });
        return res.send(list);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// own stock
const ownStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const branchId = (_b = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const category = (_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.category;
        const model = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.model;
        const skuCode = (_e = req === null || req === void 0 ? void 0 : req.query) === null || _e === void 0 ? void 0 : _e.skuCode;
        const stockArr = [];
        if (skuCode) {
            // get stocks by sku code
            const stock = yield (0, stock_utils_1.branchStockBySkuId)(branchId, skuCode);
            stockArr.push(stock);
        }
        else if (model) {
            // get stocks by model
            const getSkuCodes = yield server_1.prisma.skuCode.findMany({
                where: { item: { modelId: model } },
                select: {
                    id: true,
                },
            });
            for (const sku of getSkuCodes) {
                const stock = yield (0, stock_utils_1.branchStockBySkuId)(branchId, sku.id);
                stockArr.push(stock);
            }
        }
        else if (category) {
            // get stocks by model
            const getSkuCodes = yield server_1.prisma.skuCode.findMany({
                where: { item: { model: { categoryId: category } } },
                select: {
                    id: true,
                },
            });
            for (const sku of getSkuCodes) {
                const stock = yield (0, stock_utils_1.branchStockBySkuId)(branchId, sku.id);
                stockArr.push(stock);
            }
        }
        else {
            // get stocks by model
            const getSkuCodes = yield server_1.prisma.skuCode.findMany({});
            for (const sku of getSkuCodes) {
                const stock = yield (0, stock_utils_1.branchStockBySkuId)(branchId, sku.id);
                stockArr.push(stock);
            }
        }
        res.send(stockArr);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});
// own stock by sku id
const ownStockBySkuId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const skuCodeId = req.query.skuCodeId;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const stock = yield (0, stock_utils_1.branchStockBySkuId)(branchId, skuCodeId);
        res.send(stock);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// engineer stock
const engineerStockBySku = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const engineerId = req.params.engineerId;
        const skuId = req.params.skuId;
        const stock = yield (0, stock_utils_1.engineerStockBySkuId)(engineerId, skuId);
        res.send(stock);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock transfer
const transfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        let list = req.body.list;
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
// return
const returnStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let list = req.body.list;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const newList = list.map((item) => {
            item.senderId = branchId;
            item.type = "faulty";
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
// stock receive
const receiveStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const result = yield server_1.prisma.stock.findMany({
            where: { receiverId: branchId, type: "transfer", status: "approved" },
            include: {
                sender: true,
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
//  stock status update
const statusUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stockId = req.params.stockId;
        const data = Object.assign({}, req.body);
        if ((data === null || data === void 0 ? void 0 : data.status) !== "approved") {
            data.endAt = moment_timezone_1.default.tz("Asia/Dhaka").toISOString();
        }
        const result = yield server_1.prisma.stock.update({ where: { id: stockId }, data });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock receive report
const receiveReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const list = yield server_1.prisma.stock.findMany({
            where: {
                type: "transfer",
                receiverId: branchId,
                createdAt: { gte: from, lte: to },
                status: { in: ["received", "rejected"] },
            },
            select: {
                quantity: true,
                createdAt: true,
                receiverId: true,
                receiver: {
                    select: {
                        name: true,
                    },
                },
                skuCode: {
                    select: {
                        name: true,
                        item: {
                            select: {
                                name: true,
                                uom: true,
                                model: {
                                    select: {
                                        name: true,
                                        category: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.send(list);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// stock entry list
const transferList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const list = yield server_1.prisma.stock.findMany({
            where: {
                type: "transfer",
                senderId: branchId,
                createdAt: { gte: from, lte: to },
            },
            select: {
                quantity: true,
                createdAt: true,
                receiverId: true,
                receiver: {
                    select: {
                        name: true,
                    },
                },
                skuCode: {
                    select: {
                        name: true,
                        item: {
                            select: {
                                name: true,
                                uom: true,
                                model: {
                                    select: {
                                        name: true,
                                        category: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.send(list);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// approval stock
const approvalStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield server_1.prisma.stock.findMany({
            where: { type: "transfer", status: "open" },
            include: {
                receiver: true,
                sender: true,
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
// get defective by branch
const getDefective = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const branchId = (_b = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const category = (_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.category;
        const model = (_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.model;
        const skuCode = (_e = req === null || req === void 0 ? void 0 : req.query) === null || _e === void 0 ? void 0 : _e.skuCode;
        const stockArr = [];
        const skuIds = [];
        if (skuCode) {
            skuIds.push(skuCode);
        }
        else {
            let search = {};
            if (model) {
                search = { item: { modelId: model } };
            }
            else if (category) {
                search = { item: { model: { categoryId: category } } };
            }
            const skuCodes = yield server_1.prisma.skuCode.findMany({
                where: search,
                select: {
                    id: true,
                },
            });
            for (const sku of skuCodes) {
                skuIds.push(sku.id);
            }
        }
        // get defective by sku id
        for (const id of skuIds) {
            const getSku = yield server_1.prisma.skuCode.findUnique({
                where: { id },
                include: {
                    item: { include: { model: { include: { category: true } } } },
                },
            });
            const quantity = yield (0, stock_utils_1.getBranchDefective)(branchId, id);
            if (quantity > 0)
                stockArr.push({ skuCode: getSku, quantity });
        }
        res.send(stockArr);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// defective to scrap
const sendDefective = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        let data = req.body.list;
        const challan = `DC-${(0, challan_utils_1.generateChallan)()}`;
        data = data.map((i) => (Object.assign(Object.assign({}, i), { type: "defective" })));
        const result = yield server_1.prisma.stock.create({
            data: {
                type: "defective",
                senderId: branchId,
                challan: challan,
                items: { create: data },
            },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// defective to scrap
const moveToScrap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        let data = req.body.list;
        const challan = `SC-${(0, challan_utils_1.generateChallan)()}`;
        data = data.map((i) => (Object.assign(Object.assign({}, i), { type: "scrap" })));
        const result = yield server_1.prisma.stock.create({
            data: {
                type: "scrap",
                senderId: branchId,
                challan: challan,
                items: { create: data },
            },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = {
    entry,
    transfer,
    entryList,
    transferList,
    ownStock,
    ownStockBySkuId,
    receiveStock,
    statusUpdate,
    receiveReport,
    approvalStock,
    returnStock,
    engineerStockBySku,
    getDefective,
    moveToScrap,
    sendDefective,
};
