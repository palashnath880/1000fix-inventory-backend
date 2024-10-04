"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth.route"));
const user_route_1 = __importDefault(require("./user.route"));
const branch_route_1 = __importDefault(require("./branch.route"));
const category_route_1 = __importDefault(require("./category.route"));
const model_route_1 = __importDefault(require("./model.route"));
const item_route_1 = __importDefault(require("./item.route"));
const skuCode_route_1 = __importDefault(require("./skuCode.route"));
const stock_route_1 = __importDefault(require("./stock.route"));
const job_route_1 = __importDefault(require("./job.route"));
const engineerStock_route_1 = __importDefault(require("./engineerStock.route"));
const verifyToken_1 = require("../middlewares/verifyToken");
const challan_route_1 = __importDefault(require("./challan.route"));
const report_route_1 = __importDefault(require("./report.route"));
const scrap_route_1 = __importDefault(require("./scrap.route"));
const faulty_route_1 = __importDefault(require("./faulty.route"));
const routes = (0, express_1.Router)();
// auth route
routes.use("/auth", auth_route_1.default);
// user route
routes.use("/user", verifyToken_1.verifyAuthToken, user_route_1.default);
// branch route
routes.use("/branch", verifyToken_1.verifyAuthToken, branch_route_1.default);
// category route
routes.use("/category", verifyToken_1.verifyAuthToken, category_route_1.default);
// model route
routes.use("/model", verifyToken_1.verifyAuthToken, model_route_1.default);
// item route
routes.use("/item", verifyToken_1.verifyAuthToken, item_route_1.default);
// item route
routes.use("/sku-code", verifyToken_1.verifyAuthToken, skuCode_route_1.default);
// stock route
routes.use("/stock", verifyToken_1.verifyAuthToken, stock_route_1.default);
// engineer stock route
routes.use("/engineer-stock", verifyToken_1.verifyAuthToken, engineerStock_route_1.default);
// job route
routes.use("/job", verifyToken_1.verifyAuthToken, job_route_1.default);
// challan route
routes.use("/challan", verifyToken_1.verifyAuthToken, challan_route_1.default);
// report
routes.use("/report", verifyToken_1.verifyAuthToken, report_route_1.default);
// scrap
routes.use("/scrap", verifyToken_1.verifyAuthToken, scrap_route_1.default);
// faulty
routes.use("/faulty", verifyToken_1.verifyAuthToken, faulty_route_1.default);
exports.default = routes;
