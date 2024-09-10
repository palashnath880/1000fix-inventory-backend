"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("./user.route"));
const branch_route_1 = __importDefault(require("./branch.route"));
const routes = (0, express_1.Router)();
// user route
routes.use("/user", user_route_1.default);
// branch route
routes.use("/branch", branch_route_1.default);
exports.default = routes;
