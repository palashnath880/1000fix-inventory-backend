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
// create sku
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
        // get sku by item id
        const getSkuByItem = yield server_1.prisma.skuCode.findUnique({
            where: { itemId: skuCode.itemId },
        });
        if (getSkuByItem) {
            return res
                .status(409)
                .send({ message: "SKU code already exists at this item" });
        }
        // insert
        const result = yield server_1.prisma.skuCode.create({ data: skuCode });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// get all sku
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
                        modelId: true,
                        model: {
                            select: { name: true, category: { select: { name: true } } },
                        },
                    },
                },
            },
        });
        res.send(skuCodes);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});
// update sku
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skuId = req.params.skuId;
        const data = req.body;
        // if update name
        if (data === null || data === void 0 ? void 0 : data.name) {
            const getSku = yield server_1.prisma.skuCode.findFirst({
                where: { name: data.name, id: { not: skuId } },
            });
            if (getSku) {
                return res.status(409).send({ message: `${data.name} already exists` });
            }
        }
        // update
        yield server_1.prisma.skuCode.update({ data: data, where: { id: skuId } });
        res.send({ message: `Updated` });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// delete sku
const deleteSkuCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skuId = req.params.skuId;
        const result = yield server_1.prisma.skuCode.delete({
            where: { id: skuId },
            include: {
                challanItems: true,
                enStock: true,
                faulty: true,
                jobItems: true,
                scrapItems: true,
                stockItems: true,
                stocks: true,
            },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, get, deleteSkuCode, update };
