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
const challan_route_1 = __importDefault(require("./challan.route"));
const report_route_1 = __importDefault(require("./report.route"));
const scrap_route_1 = __importDefault(require("./scrap.route"));
const faulty_route_1 = __importDefault(require("./faulty.route"));
const uom_route_1 = __importDefault(require("./uom.route"));
const middleware_1 = require("../middleware");
const routes = (0, express_1.Router)();
// auth route
routes.use("/auth", auth_route_1.default);
// user route
routes.use("/user", middleware_1.isAuthenticate, user_route_1.default);
// branch route
routes.use("/branch", middleware_1.isAuthenticate, branch_route_1.default);
// category route
routes.use("/category", middleware_1.isAuthenticate, category_route_1.default);
// model route
routes.use("/model", middleware_1.isAuthenticate, model_route_1.default);
// item route
routes.use("/item", middleware_1.isAuthenticate, item_route_1.default);
// item route
routes.use("/sku-code", middleware_1.isAuthenticate, skuCode_route_1.default);
// stock route
routes.use("/stock", middleware_1.isAuthenticate, stock_route_1.default);
// engineer stock route
routes.use("/engineer-stock", middleware_1.isAuthenticate, engineerStock_route_1.default);
// job route
routes.use("/job", middleware_1.isAuthenticate, job_route_1.default);
// challan route
routes.use("/challan", middleware_1.isAuthenticate, challan_route_1.default);
// report
routes.use("/report", middleware_1.isAuthenticate, report_route_1.default);
// scrap
routes.use("/scrap", middleware_1.isAuthenticate, scrap_route_1.default);
// faulty
routes.use("/faulty", middleware_1.isAuthenticate, faulty_route_1.default);
// uom
routes.use("/uom", middleware_1.isAuthenticate, uom_route_1.default);
exports.default = routes;
