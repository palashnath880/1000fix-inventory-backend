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
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const server_1 = require("../server");
const report_utils_1 = require("../utils/report.utils");
const stock_utils_1 = require("../utils/stock.utils");
// scrap report
const scrap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let fromDate = req.query.fromDate;
        fromDate = fromDate ? new Date(fromDate) : new Date();
        let toDate = req.query.toDate;
        toDate = toDate
            ? new Date(toDate)
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));
        const result = yield server_1.prisma.scrap.findMany({
            where: { createdAt: { gte: fromDate, lte: toDate } },
            include: {
                items: {
                    include: {
                        skuCode: {
                            include: {
                                item: { include: { model: { include: { category: true } } } },
                            },
                        },
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
// engineer return faulty and good stock report by branch
const enReRepByBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const type = req.params.type;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        let fromDate = req.query.fromDate;
        fromDate = fromDate ? new Date(fromDate) : new Date();
        let toDate = req.query.toDate;
        toDate = toDate
            ? new Date(toDate)
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));
        const result = yield server_1.prisma.engineerStock.findMany({
            where: { type, branchId, createdAt: { gte: fromDate, lte: toDate } },
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
// get aging report
const agingReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const isAdmin = ((_d = (_c = req === null || req === void 0 ? void 0 : req.cookies) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.role) === "admin";
        const skuId = req.query.skuId;
        const arr = [];
        if (skuId) {
            const report = yield (0, report_utils_1.agingReportBySku)(branchId, skuId, isAdmin);
            const skuCode = yield (0, stock_utils_1.getSku)(skuId);
            if (report) {
                arr.push({ skuCode, report });
            }
        }
        else {
            const skuCodes = yield server_1.prisma.skuCode.findMany({ select: { id: true } });
            for (const sku of skuCodes) {
                const report = yield (0, report_utils_1.agingReportBySku)(branchId, sku.id, isAdmin);
                const skuCode = yield (0, stock_utils_1.getSku)(sku.id);
                if (report) {
                    arr.push({ skuCode, report });
                }
            }
        }
        res.send(arr);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { scrap, enReRepByBranch, agingReport };
