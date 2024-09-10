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
        const category = req.body;
        // check category
        const getCate = yield server_1.prisma.category.findUnique({
            where: { name: category.name },
        });
        if (getCate) {
            return res.status(409).send({ message: `This category already exists` });
        }
        const result = yield server_1.prisma.category.create({ data: category });
        res.status(201).send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const categories = yield server_1.prisma.category.findMany({
            where: search
                ? {
                    name: { contains: search },
                }
                : {},
        });
        res.send(categories);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.categoryId;
        const result = yield server_1.prisma.category.delete({ where: { id: categoryId } });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, get, deleteCategory };
