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
exports.verifyAuthToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const server_1 = require("../server");
const verifyAuthToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers.authorization;
        const SECRET_KEY = process.env.JWT_SECRET_KEY || "";
        if (token) {
            const authToken = token.split(" ")[1];
            const decoded = yield (0, jsonwebtoken_1.verify)(authToken, SECRET_KEY);
            if (decoded) {
                const userId = decoded === null || decoded === void 0 ? void 0 : decoded.id;
                const user = yield server_1.prisma.user.findUnique({ where: { id: userId } });
                req.cookies = { user: user };
                next();
            }
            else {
                return res.status(401).send({ message: `Unauthorized` });
            }
        }
        else {
            return res.status(401).send({ message: `Unauthorized` });
        }
    }
    catch (err) {
        res.status(401).send({ message: `Unauthorized`, err });
    }
});
exports.verifyAuthToken = verifyAuthToken;
