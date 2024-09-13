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
        const model = req.body;
        // get model
        const getModel = yield server_1.prisma.model.findUnique({
            where: { name: model.name },
        });
        if (getModel) {
            return res.status(409).send({ message: "Model already exists" });
        }
        // insert
        const result = yield server_1.prisma.model.create({ data: model });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const models = yield server_1.prisma.model.findMany({
            where: search ? { name: { contains: search } } : {},
            include: {
                category: true,
            },
        });
        res.send(models);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const deleteModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modelId = req.params.modelId;
        const result = yield server_1.prisma.model.delete({ where: { id: modelId } });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, get, deleteModel };
