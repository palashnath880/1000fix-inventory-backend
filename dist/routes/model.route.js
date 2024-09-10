"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_controller_1 = __importDefault(require("../controllers/model.controller"));
const modelRouter = (0, express_1.Router)();
// post
modelRouter.post(`/`, model_controller_1.default.create);
// get
modelRouter.get(`/`, model_controller_1.default.get);
// delete
modelRouter.delete(`/:modelId`, model_controller_1.default.deleteModel);
exports.default = modelRouter;
