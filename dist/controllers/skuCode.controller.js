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
    try {
        const skuCode = req.body;
        // get sku code
        const getSku = yield server_1.prisma.skuCode.findUnique({
            where: { name: skuCode.name },
        });
        if (getSku) {
            return res.status(409).send({ message: "SKU code already exists" });
        }
        // insert
        const result = yield server_1.prisma.skuCode.create({ data: skuCode });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const skuCodes = yield server_1.prisma.skuCode.findMany({
            where: search ? { name: { contains: search } } : {},
            include: {
                item: {
                    select: {
                        name: true,
                        uom: true,
                    },
                    include: {
                        model: {
                            select: { name: true },
                            include: { category: { select: { name: true } } },
                        },
                    },
                },
            },
        });
        res.send(skuCodes);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const deleteSkuCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skuId = req.params.skuId;
        const result = yield server_1.prisma.skuCode.delete({ where: { id: skuId } });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, get, deleteSkuCode };
