"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const userRouter = (0, express_1.Router)();
// post route
userRouter.post(`/`, user_controller_1.default.create);
// get all route
userRouter.get(`/`, user_controller_1.default.get);
// get by  id
userRouter.get(`/:userId`, user_controller_1.default.getById);
// put route
userRouter.put(`/:userId`, user_controller_1.default.update);
// delete route
userRouter.delete("/:userId", user_controller_1.default.deleteUser);
exports.default = userRouter;
