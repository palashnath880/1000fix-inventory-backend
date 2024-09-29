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
// transfer report
engineerStockRouter.get(`/transfer`, engineerStock_controller_1.default.brTrReport);
// stock return
engineerStockRouter.post(`/return`, engineerStock_controller_1.default.stockReturn);
// return faulty and good stock by branch
engineerStockRouter.get(`/return-stock/:type`, engineerStock_controller_1.default.stockByBranch);
// faulty stock return
engineerStockRouter.post(`/faulty-return`, engineerStock_controller_1.default.faultyReturn);
// send defective
engineerStockRouter.post(`/defective`, engineerStock_controller_1.default.sendDefective);
// faulty stock return report
engineerStockRouter.get(`/report/:userId`, engineerStock_controller_1.default.report);
// receive stock
engineerStockRouter.get(`/receive`, engineerStock_controller_1.default.receive);
// receive stock
engineerStockRouter.get(`/receive-report/:userId`, engineerStock_controller_1.default.stockReport);
// status update
engineerStockRouter.put(`/:stockId`, engineerStock_controller_1.default.update);
// get by engineer id
engineerStockRouter.get(`/:id`, engineerStock_controller_1.default.getByEngineer);
exports.default = engineerStockRouter;
