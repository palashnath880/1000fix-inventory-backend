import { Router } from "express";
import scrapController from "../controllers/scrap.controller";

const scrapRouter = Router();

// post route
scrapRouter.post(`/`, scrapController.create);

export default scrapRouter;
