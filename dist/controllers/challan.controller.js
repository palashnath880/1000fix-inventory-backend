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
const challan_utils_1 = require("../utils/challan.utils");
// create controller
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const challan = req.body;
        const challanNo = (0, challan_utils_1.generateChallan)();
        if (challanNo)
            challan.challanNo = `GC-${challanNo}`;
        const result = yield server_1.prisma.challan.create({
            data: Object.assign(Object.assign({}, challan), { items: { create: challan.items } }),
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// get by id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const result = yield server_1.prisma.challan.findUnique({
            where: { id },
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
// get by date range and challan no
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        const page = parseInt(req.query.page) || 1;
        if (!fromDate || !toDate) {
            return res.send([]);
        }
        const result = yield server_1.prisma.challan.findMany({
            where: {
                createdAt: { gte: new Date(fromDate), lte: new Date(toDate) },
            },
            skip: (page - 1) * 50,
            take: 50,
            include: { items: { include: { skuCode: true } } },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// delete by id
const deleteChallan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const result = yield server_1.prisma.challan.delete({ where: { id } });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, getById, getAll, deleteChallan };
