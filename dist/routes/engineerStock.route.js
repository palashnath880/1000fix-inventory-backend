"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const engineerStock_controller_1 = __importDefault(require("../controllers/engineerStock.controller"));
const engineerStockRouter = (0, express_1.Router)();
// own stock route
engineerStockRouter.get(`/own`, engineerStock_controller_1.default.ownStock);
// engineer stock by sku id
engineerStockRouter.get(`/get-by-sku/:userId/:skuId`, engineerStock_controller_1.default.stockBySkuId);
// transfer to engineer
engineerStockRouter.post(`/transfer`, engineerStock_controller_1.default.transfer);
// status update
engineerStockRouter.put(`/status/:stockId`, engineerStock_controller_1.default.statusUpdate);
exports.default = engineerStockRouter;
