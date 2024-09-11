"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const verifyToken_1 = require("../middlewares/verifyToken");
const authRouter = (0, express_1.Router)();
// login route
authRouter.post(`/login`, auth_controller_1.default.login);
// user route
authRouter.post(`/user`, verifyToken_1.verifyAuthToken, auth_controller_1.default.loadUser);
exports.default = authRouter;
