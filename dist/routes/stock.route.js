"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stock_controller_1 = __importDefault(require("../controllers/stock.controller"));
const stockRouter = (0, express_1.Router)();
// entry route
stockRouter.post(`/entry`, stock_controller_1.default.entry);
// get entry list route
stockRouter.get(`/entry`, stock_controller_1.default.entryList);
// own stock roue
stockRouter.get(`/own`, stock_controller_1.default.ownStock);
// own stock by sku id
stockRouter.get(`/get-by-sku`, stock_controller_1.default.ownStockBySkuId);
// transfer to branch
stockRouter.post(`/transfer`, stock_controller_1.default.transfer);
// transfer list
stockRouter.get(`/transfer`, stock_controller_1.default.transferList);
// receive stock list
stockRouter.get(`/receive`, stock_controller_1.default.receiveStock);
// transfer to engineer
stockRouter.post(`/transfer-to-engineer`, stock_controller_1.default.transferToEngineer);
exports.default = stockRouter;
