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
// engineer stock by sku id
stockRouter.get(`/get-by-sku/:engineerId/:skuId`, stock_controller_1.default.engineerStockBySku);
// transfer to branch
stockRouter.post(`/transfer`, stock_controller_1.default.transfer);
// return stock
stockRouter.post(`/return`, stock_controller_1.default.returnStock);
// transfer list
stockRouter.get(`/transfer`, stock_controller_1.default.transferList);
// receive stock list
stockRouter.get(`/receive`, stock_controller_1.default.receiveStock);
// receive stock list
stockRouter.get(`/receive/report`, stock_controller_1.default.receiveReport);
// status update
stockRouter.put(`/status/:stockId`, stock_controller_1.default.statusUpdate);
// get approval stock
stockRouter.get(`/approval`, stock_controller_1.default.approvalStock);
// get defective stock
stockRouter.get(`/defective`, stock_controller_1.default.getDefective);
// send defective stock
stockRouter.post(`/defective-send`, stock_controller_1.default.sendDefective);
// defective to scrap
stockRouter.post(`/scrap`, stock_controller_1.default.moveToScrap);
exports.default = stockRouter;
