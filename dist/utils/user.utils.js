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
exports.hashPassword = exports.generateUsername = void 0;
const server_1 = require("../server");
const bcrypt_1 = require("bcrypt");
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
const hashPassword = (plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield (0, bcrypt_1.genSalt)(10);
    const password = yield (0, bcrypt_1.hash)(plainPassword, salt);
    return password;
});
exports.hashPassword = hashPassword;
