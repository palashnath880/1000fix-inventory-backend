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
        const branch = req.body;
        // check branch
        const getBranch = yield server_1.prisma.branch.findUnique({
            where: { name: branch.name },
        });
        if (getBranch) {
            return res.status(409).send({ message: "This branch already exists" });
        }
        // insert branch
        const result = yield server_1.prisma.branch.create({ data: branch });
        res.status(201).send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        const branches = yield server_1.prisma.branch.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search } },
                        { address: { contains: search } },
                    ],
                }
                : {},
        });
        res.send(branches);
    }
    catch (err) { }
});
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const branchId = req.params.branchId;
        const data = req.body;
        const updateData = {};
        if (data === null || data === void 0 ? void 0 : data.name)
            updateData.name = data === null || data === void 0 ? void 0 : data.name;
        if (data === null || data === void 0 ? void 0 : data.address)
            updateData.address = data === null || data === void 0 ? void 0 : data.address;
        if (Array.isArray(data === null || data === void 0 ? void 0 : data.users) && ((_a = data === null || data === void 0 ? void 0 : data.users) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            // update branchId is null which users are deselected
            yield server_1.prisma.user.updateMany({
                data: { branchId: null },
                where: { branchId: branchId, id: { notIn: data === null || data === void 0 ? void 0 : data.users } },
            });
            // update branchId in the selected users
            yield server_1.prisma.user.updateMany({
                data: { branchId: branchId },
                where: { id: { in: data === null || data === void 0 ? void 0 : data.users } },
            });
        }
        const result = yield server_1.prisma.branch.update({
            data: updateData,
            where: { id: branchId },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branchId = req.params.branchId;
        const result = yield server_1.prisma.branch.delete({ where: { id: branchId } });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, get, update, deleteBranch };
