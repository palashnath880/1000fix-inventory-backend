import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import branchRouter from "./branch.route";
import cateRouter from "./category.route";
import modelRouter from "./model.route";
import itemRouter from "./item.route";
import skuRouter from "./skuCode.route";
import stockRouter from "./stock.route";
import jobRouter from "./job.route";
import enStockRouter from "./engineerStock.route";
import challanRouter from "./challan.route";
import reportRouter from "./report.route";
import scrapRouter from "./scrap.route";
import faultyRouter from "./faulty.route";
import uomRouter from "./uom.route";
import { isAuthenticate } from "../middleware";

const routes = Router();

// auth route
routes.use("/auth", authRouter);

// user route
routes.use("/user", isAuthenticate, userRouter);

// branch route
routes.use("/branch", isAuthenticate, branchRouter);

// category route
routes.use("/category", isAuthenticate, cateRouter);

// model route
routes.use("/model", isAuthenticate, modelRouter);

// item route
routes.use("/item", isAuthenticate, itemRouter);

// item route
routes.use("/sku-code", isAuthenticate, skuRouter);

// stock route
routes.use("/stock", isAuthenticate, stockRouter);

// engineer stock route
routes.use("/engineer-stock", isAuthenticate, enStockRouter);

// job route
routes.use("/job", isAuthenticate, jobRouter);

// challan route
routes.use("/challan", isAuthenticate, challanRouter);

// report
routes.use("/report", isAuthenticate, reportRouter);

// scrap
routes.use("/scrap", isAuthenticate, scrapRouter);

// faulty
routes.use("/faulty", isAuthenticate, faultyRouter);

// uom
routes.use("/uom", isAuthenticate, uomRouter);

export default routes;
