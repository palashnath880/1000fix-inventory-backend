import { Router } from "express";
import faultyController from "../controllers/faulty.controller";

const faultyRouter = Router();

// post
faultyRouter.post(`/`, faultyController.create);

// report
faultyRouter.get(`/report`, faultyController.report);

// update action
faultyRouter.put(`/:id`, faultyController.faultyAction);

// get
faultyRouter.get(`/head-faulty`, faultyController.headFaulty);

// own faulty
faultyRouter.get(`/own-stock`, faultyController.ownFaulty);

export default faultyRouter;
