"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challan_controller_1 = __importDefault(require("../controllers/challan.controller"));
const challanRouter = (0, express_1.Router)();
// post route
challanRouter.post(`/`, challan_controller_1.default.create);
// get by id
challanRouter.get(`/:id`, challan_controller_1.default.getById);
// get all
challanRouter.get(`/`, challan_controller_1.default.getAll);
// delete
challanRouter.delete(`/:id`, challan_controller_1.default.deleteChallan);
exports.default = challanRouter;
