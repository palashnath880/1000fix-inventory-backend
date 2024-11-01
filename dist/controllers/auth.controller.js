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
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_utils_1 = require("../utils/user.utils");
const mail_utils_1 = require("../utils/mail.utils");
// login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const login = req.body.login;
        const password = req.body.password;
        const SECRET_KEY = process.env.JWT_SECRET_KEY || "";
        // get user
        const user = yield server_1.prisma.user.findFirst({
            where: {
                OR: [{ email: login }, { username: login }],
            },
        });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        if (yield (0, bcrypt_1.compare)(password, user.password)) {
            const token = yield (0, jsonwebtoken_1.sign)(user, SECRET_KEY, {
                expiresIn: 60 * 60 * 24 * 7,
            });
            res.send({ token });
        }
        else {
            return res.status(401).send({ message: "Incorrect password" });
        }
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const loadUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const user = yield server_1.prisma.user.findUnique({
            where: { id: userId },
            include: { branch: true },
        });
        if (user) {
            const keys = Object.keys(user);
            const newObj = {};
            for (const key of keys) {
                if (key !== "password") {
                    newObj[key] = user[key];
                }
            }
            return res.send(newObj);
        }
        res.send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// send reset password link
const sendPwdResetLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const login = req.body.login;
        const SECRET_KEY = process.env.JWT_SECRET_KEY || "";
        const FRONTEND_URL = process.env.FRONTEND_URL || "";
        // get user by email or username
        const getUser = yield server_1.prisma.user.findFirst({
            where: { OR: [{ username: login }, { email: login }] },
        });
        if (!getUser) {
            return res.status(404).send({ message: `User not found.` });
        }
        const token = yield (0, jsonwebtoken_1.sign)(getUser, SECRET_KEY, {
            expiresIn: 60 * 60 * 1,
        });
        // insert the database
        const resetRes = yield server_1.prisma.resetPwd.create({
            data: { jwtToken: token, userId: getUser.id },
        });
        const url = `${FRONTEND_URL}/update-pwd/?tokenId=${resetRes.id}`;
        const sentEmail = yield (0, mail_utils_1.send_reset_email)(url, getUser.username, getUser.email);
        if (sentEmail) {
            return res.send({ message: `link sent` });
        }
        else {
            return res.status(400).send({ message: `link doesn't sent` });
        }
    }
    catch (err) {
        res.status(400).send(err);
    }
});
// update reset password
const updateResetPass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.tokenId;
        const password = req.body.password;
        const SECRET_KEY = process.env.JWT_SECRET_KEY || "";
        const result = yield server_1.prisma.resetPwd.findUnique({
            where: { id, status: "open" },
        });
        if (!result)
            return res.status(404).send({ message: `Invalid token` });
        const token = result.jwtToken;
        const decoded = yield (0, jsonwebtoken_1.verify)(token, SECRET_KEY);
        if (decoded) {
            const hashPwd = yield (0, user_utils_1.hashPassword)(password);
            // update user pass
            yield server_1.prisma.user.update({
                data: { password: hashPwd },
                where: { id: result.userId },
            });
            yield server_1.prisma.resetPwd.update({
                data: { status: "close" },
                where: { id },
            });
            return res.send({ message: `password updated` });
        }
        return res.status(400).send({ message: `Invalid token` });
    }
    catch (err) {
        console.log(err);
        return res.status(400).send(err);
    }
});
// change password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const prevPwd = req.body.prev;
        const newPwd = req.body.new;
        const userId = (_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
        const user = yield server_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        if (!(yield (0, bcrypt_1.compare)(prevPwd, user.password))) {
            return res
                .status(401)
                .send({ message: "Previous password doesn't matched" });
        }
        const password = yield (0, user_utils_1.hashPassword)(newPwd);
        const result = yield server_1.prisma.user.update({
            data: { password },
            where: { id: userId },
        });
        res.send(result);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
exports.default = {
    login,
    loadUser,
    sendPwdResetLink,
    changePassword,
    updateResetPass,
};
