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
const jobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId;
        const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : "";
        const toDate = req.query.toDate ? new Date(req.query.toDate) : "";
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        // get list
        const result = yield server_1.prisma.job.findMany({
            where: {
                branchId: id,
                createdAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            include: {
                items: { include: { skuCode: true } },
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
        res.status(400).send(err);
    }
});
exports.default = { create, jobList };
