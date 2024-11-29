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
exports.genRefreshToken = exports.genAccessToken = exports.hashPassword = exports.generateUsername = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const server_1 = require("../server");
const bcrypt_1 = require("bcrypt");
// generate a username based on the name
const generateUsername = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let username = name.toLowerCase();
        username = username.replace(/\s/g, "");
        if (username.length > 10) {
            username = username.substring(0, 10);
        }
        // check user with the username
        const getUser = yield server_1.prisma.user.findMany({ where: { username } });
        if (getUser && (getUser === null || getUser === void 0 ? void 0 : getUser.length) > 0) {
            username = `${username}${getUser.length + 1}`;
        }
        return username;
    }
    catch (err) {
        throw new Error(`Sorry! username couldn't be generate`);
    }
});
exports.generateUsername = generateUsername;
// hash plain password
const hashPassword = (plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield (0, bcrypt_1.genSalt)(10);
    const password = yield (0, bcrypt_1.hash)(plainPassword, salt);
    return password;
});
exports.hashPassword = hashPassword;
// generate access token
const genAccessToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const SECRET_KEY = process.env.JWT_SECRET_KEY || "";
        const token = yield (0, jsonwebtoken_1.sign)(user, SECRET_KEY, {
            expiresIn: "10m",
        });
        return token;
    }
    catch (err) {
        throw new Error((err === null || err === void 0 ? void 0 : err.message) || "Unable to generate access token");
    }
});
exports.genAccessToken = genAccessToken;
// generate refresh token
const genRefreshToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY || "";
        const token = yield (0, jsonwebtoken_1.sign)(user, REFRESH_SECRET_KEY, {
            expiresIn: "7 days",
        });
        return token;
    }
    catch (err) {
        throw new Error((err === null || err === void 0 ? void 0 : err.message) || "Unable to generate refresh token");
    }
});
exports.genRefreshToken = genRefreshToken;
