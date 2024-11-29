"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const middleware_1 = require("../middleware");
const authRouter = (0, express_1.Router)();
// login route
authRouter.post(`/login`, auth_controller_1.default.login);
// refresh token
authRouter.post(`/refresh-token`, auth_controller_1.default.refreshToken);
// change password route
authRouter.post(`/change-password`, middleware_1.isAuthenticate, auth_controller_1.default.changePassword);
// update reset password
authRouter.post(`/update-reset-pwd`, auth_controller_1.default.updateResetPass);
// send reset link
authRouter.post(`/send-reset-link`, auth_controller_1.default.sendPwdResetLink);
exports.default = authRouter;
