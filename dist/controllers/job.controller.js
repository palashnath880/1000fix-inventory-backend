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
// create job
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const newJob = req.body;
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        // insert
        const result = yield server_1.prisma.job.create({
            data: {
                imeiNo: newJob.imeiNo,
                jobNo: newJob.jobNo,
                sellFrom: newJob.sellFrom,
                branchId: branchId,
                serviceType: newJob.serviceType,
                engineerId: (newJob === null || newJob === void 0 ? void 0 : newJob.engineerId) || null,
                items: {
                    create: newJob.items,
                },
            },
        });
        res.status(201).send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// job list
const jobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const filter = req.query.filter;
        let engineers = req.query.engineers || [];
        if (typeof engineers === "string")
            engineers = [engineers];
        let fromDate = req.query.fromDate;
        fromDate = fromDate
            ? new Date(fromDate)
            : new Date((0, moment_timezone_1.default)().tz("Asia/Dhaka").format("YYYY-MM-DD"));
        let toDate = req.query.toDate;
        toDate = toDate
            ? new Date((0, moment_timezone_1.default)(toDate).add(1, "days").format("YYYY-MM-DD"))
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));
        let search = {};
        if (filter === "branch")
            search = { branchId: branchId, engineerId: null };
        if (filter === "engineer")
            search = { engineerId: { in: engineers } };
        if (filter === "engineer" && engineers.length <= 0)
            search = { branchId, engineerId: { not: null } };
        if (!filter)
            search = { branchId };
        // get job entry list
        const result = yield server_1.prisma.job.findMany({
            where: {
                AND: [search],
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            include: {
                items: { include: { skuCode: { include: { item: true } } } },
                engineer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.send(result);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});
// job summary report
const jobSummaryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let fromDate = req.query.fromDate;
        fromDate = fromDate
            ? new Date(fromDate)
            : new Date((0, moment_timezone_1.default)().tz("Asia/Dhaka").format("YYYY-MM-DD"));
        let toDate = req.query.toDate;
        toDate = toDate
            ? new Date((0, moment_timezone_1.default)(toDate).add(1, "days").format("YYYY-MM-DD"))
            : new Date(moment_timezone_1.default.tz("Asia/Dhaka").add(1, "days").format("YYYY-MM-DD"));
        // get job entry summary list
        const result = yield server_1.prisma.jobItem.findMany({
            where: {
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
        console.log(err);
        res.status(400).send(err);
    }
});
// get job entry graph by month
const jobEntryGraph = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const branchId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const month = req.query.month;
        const start = new Date();
        start.setMonth(parseInt(month) - 1);
        start.setDate(1);
        const end = new Date();
        end.setMonth(parseInt(month));
        end.setDate(1);
        const result = {};
        const rows = yield server_1.prisma.jobItem.groupBy({
            _sum: { quantity: true },
            by: ["createdAt"],
            where: {
                createdAt: {
                    gte: start,
                    lte: end,
                },
                job: {
                    branchId: branchId,
                },
            },
            orderBy: { createdAt: "asc" },
        });
        for (const row of rows) {
            const date = new Date(row.createdAt);
            const day = date.getDate();
            if (result[day]) {
                result[day] += row._sum.quantity;
            }
            else {
                result[day] = row._sum.quantity;
            }
        }
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, jobList, jobSummaryList, jobEntryGraph };
