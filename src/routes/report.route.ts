import { Router } from "express";
import reportController from "../controllers/report.controller";

const reportRouter = Router();

// scrap router
reportRouter.get(`/scrap`, reportController.scrap);

// engineer good and faulty return report
reportRouter.get(`/en-return-report/:type`, reportController.enReRepByBranch);

// engineer good and faulty return report
reportRouter.get(`/aging`, reportController.agingReport);

export default reportRouter;
