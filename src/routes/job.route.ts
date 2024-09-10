import { Router } from "express";
import jobController from "../controllers/job.controller";

const jobRouter = Router();

// post route
jobRouter.post(`/`, jobController.create);

// post route
jobRouter.post(`/job-list/:branchId`, jobController.jobList);

export default jobRouter;
