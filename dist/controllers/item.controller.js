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
        const item = req.body;
        // get item
        const getItem = yield server_1.prisma.item.findUnique({
            where: { name: item.name },
        });
        if (getItem) {
            return res.status(409).send({ message: "Item already exists" });
        }
        // insert
        const result = yield server_1.prisma.item.create({ data: item });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const items = yield server_1.prisma.item.findMany({
            where: search ? { name: { contains: search } } : {},
            include: {
                model: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        res.send(items);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = req.params.itemId;
        const result = yield server_1.prisma.item.delete({ where: { id: itemId } });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, get, deleteItem };
