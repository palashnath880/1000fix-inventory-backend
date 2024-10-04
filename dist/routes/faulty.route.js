"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faulty_controller_1 = __importDefault(require("../controllers/faulty.controller"));
const faultyRouter = (0, express_1.Router)();
// post
faultyRouter.post(`/`, faulty_controller_1.default.create);
// report
faultyRouter.get(`/report`, faulty_controller_1.default.report);
// update action
faultyRouter.put(`/:id`, faulty_controller_1.default.faultyAction);
//  get
faultyRouter.get(`/head-faulty`, faulty_controller_1.default.headFaulty);
exports.default = faultyRouter;
