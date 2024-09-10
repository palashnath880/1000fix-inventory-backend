"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const skuCode_controller_1 = __importDefault(require("../controllers/skuCode.controller"));
const skuCodeRouter = (0, express_1.Router)();
// post
skuCodeRouter.post(`/`, skuCode_controller_1.default.create);
// get
skuCodeRouter.get(`/`, skuCode_controller_1.default.get);
// delete
skuCodeRouter.delete(`/:modelId`, skuCode_controller_1.default.deleteSkuCode);
exports.default = skuCodeRouter;
