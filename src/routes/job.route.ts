import { Router } from "express";
import jobController from "../controllers/job.controller";

const jobRouter = Router();

// post route
jobRouter.post(`/`, jobController.create);

// job list route
jobRouter.get(`/list`, jobController.jobList);

// job summary route
jobRouter.get(`/summary`, jobController.jobSummaryList);

export default jobRouter;
