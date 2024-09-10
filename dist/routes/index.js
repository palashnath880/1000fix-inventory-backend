"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("./user.route"));
const branch_route_1 = __importDefault(require("./branch.route"));
const category_route_1 = __importDefault(require("./category.route"));
const model_route_1 = __importDefault(require("./model.route"));
const item_route_1 = __importDefault(require("./item.route"));
const skuCode_route_1 = __importDefault(require("./skuCode.route"));
const routes = (0, express_1.Router)();
// user route
routes.use("/user", user_route_1.default);
// branch route
routes.use("/branch", branch_route_1.default);
// category route
routes.use("/category", category_route_1.default);
// model route
routes.use("/model", model_route_1.default);
// item route
routes.use("/item", item_route_1.default);
// item route
routes.use("/sku-code", skuCode_route_1.default);
exports.default = routes;
