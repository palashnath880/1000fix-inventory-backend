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
const user_utils_1 = require("../utils/user.utils");
// user create controller
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = req.body;
        const branchId = ((_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.branchId) || "";
        // get user by email
        const getUser = yield server_1.prisma.user.findUnique({
            where: { email: user.email },
        });
        // if user exists at this user.email
        if (getUser) {
            return res.status(409).send({ message: "User exists at this email" });
        }
        // generate username
        const username = yield (0, user_utils_1.generateUsername)(user.name);
        user.username = username;
        // hash password
        const password = yield (0, user_utils_1.hashPassword)(user.password);
        user.password = password;
        if (user.role === "engineer") {
            user.branchId = branchId;
        }
        // insert user
        const result = yield server_1.prisma.user.create({
            data: user,
        });
        res.status(201).send(result);
    }
    catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
});
// get all user
const get = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = req.query.search;
        // get users
        const users = yield server_1.prisma.user.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search } },
                        { email: { contains: search } },
                    ],
                }
                : {},
            orderBy: { name: "asc" },
            include: { branch: { select: { name: true, id: true } } },
        });
        res.send(users);
    }
    catch (err) {
        res.send(err).status(400);
    }
});
// get by id
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.cookies.user;
        const id = user === null || user === void 0 ? void 0 : user.id;
        if (!id) {
            return res.status(404).send({ message: `User not found` });
        }
        const getUser = yield server_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                branchId: true,
                role: true,
                createdAt: true,
                branch: true,
            },
        });
        return res.send(getUser);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// get by id
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        console.log(userId);
        const user = yield server_1.prisma.user.findUnique({ where: { id: userId } });
        res.send(user);
    }
    catch (err) {
        res.send(err).status(400);
    }
});
// user update controller
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const result = yield server_1.prisma.user.update({
            data: data,
            where: { id: userId },
        });
        res.send(result);
    }
    catch (err) {
        res.send(err).status(400);
    }
});
// user delete controller
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const result = yield server_1.prisma.user.delete({ where: { id: userId } });
        res.send(result);
    }
    catch (err) {
        res.send(err).status(400);
    }
});
// update user password by admin
const updatePwd = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.body.id;
        const password = req.body.password;
        const hashedPwd = yield (0, user_utils_1.hashPassword)(password);
        // update pwd
        const result = yield server_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPwd },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = { create, deleteUser, update, get, getById, updatePwd, getMe };
