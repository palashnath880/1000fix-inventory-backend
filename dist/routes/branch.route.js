"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branch_controller_1 = __importDefault(require("../controllers/branch.controller"));
const branchRouter = (0, express_1.Router)();
// post route
branchRouter.post(`/`, branch_controller_1.default.create);
// get all route
branchRouter.get(`/`, branch_controller_1.default.get);
// get by  id
// branchRouter.get(`/:userId`, userController.getById);
// put route
branchRouter.put(`/:branchId`, branch_controller_1.default.update);
// delete route
branchRouter.delete("/:branchId", branch_controller_1.default.deleteBranch);
exports.default = branchRouter;
