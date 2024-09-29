"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = __importDefault(require("../controllers/report.controller"));
const reportRouter = (0, express_1.Router)();
// scrap router
reportRouter.get(`/scrap`, report_controller_1.default.scrap);
// engineer good and faulty return report
reportRouter.get(`/en-return-report/:type`, report_controller_1.default.enReRepByBranch);
exports.default = reportRouter;
