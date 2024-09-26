import { Router } from "express";
import reportController from "../controllers/report.controller";

const reportRouter = Router();

// scrap router
reportRouter.get(`/scrap`, reportController.scrap);

export default reportRouter;
