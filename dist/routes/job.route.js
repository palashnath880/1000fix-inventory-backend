"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = __importDefault(require("../controllers/job.controller"));
const jobRouter = (0, express_1.Router)();
// post route
jobRouter.post(`/`, job_controller_1.default.create);
// job list route
jobRouter.get(`/list`, job_controller_1.default.jobList);
// job summary route
jobRouter.get(`/summary`, job_controller_1.default.jobSummaryList);
// job graph route
jobRouter.get(`/graph`, job_controller_1.default.jobEntryGraph);
exports.default = jobRouter;
