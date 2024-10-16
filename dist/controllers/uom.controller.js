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
// uom create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // check uom is exists
        const getUom = yield server_1.prisma.uom.findUnique({ where: { name: data.name } });
        if (getUom) {
            return res.status(400).send({ message: `${data.name} already exists` });
        }
        // insert
        const result = yield server_1.prisma.uom.create({ data: data });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// get all uom
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield server_1.prisma.uom.findMany({
            where: {},
            orderBy: { name: "asc" },
        });
        return result;
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// delete uom
const deleteUOM = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        // delete uom item
        const result = yield server_1.prisma.uom.delete({ where: { id } });
        return result;
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, getAll, deleteUOM };
