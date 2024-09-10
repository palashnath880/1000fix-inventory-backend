"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const categoryRouter = (0, express_1.Router)();
// post route
categoryRouter.post(`/`, category_controller_1.default.create);
// get route
categoryRouter.get(`/`, category_controller_1.default.get);
// delete route
categoryRouter.delete(`/:categoryId`, category_controller_1.default.deleteCategory);
exports.default = categoryRouter;
