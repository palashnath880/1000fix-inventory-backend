"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scrap_controller_1 = __importDefault(require("../controllers/scrap.controller"));
const scrapRouter = (0, express_1.Router)();
// post route
scrapRouter.post(`/`, scrap_controller_1.default.create);
exports.default = scrapRouter;
