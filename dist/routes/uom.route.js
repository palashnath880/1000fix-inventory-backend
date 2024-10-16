"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uom_controller_1 = __importDefault(require("../controllers/uom.controller"));
const uomRouter = (0, express_1.Router)();
// post
uomRouter.post(`/`, uom_controller_1.default.create);
// get
uomRouter.get(`/`, uom_controller_1.default.getAll);
// delete
uomRouter.delete(`/:id`, uom_controller_1.default.deleteUOM);
exports.default = uomRouter;
