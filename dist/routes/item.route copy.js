"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const item_controller_1 = __importDefault(require("../controllers/item.controller"));
const itemRouter = (0, express_1.Router)();
// post
itemRouter.post(`/`, item_controller_1.default.create);
// get
itemRouter.get(`/`, item_controller_1.default.get);
// delete
itemRouter.delete(`/:modelId`, item_controller_1.default.deleteItem);
exports.default = itemRouter;
