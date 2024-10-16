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
import { verifyAuthToken } from "../middlewares/verifyToken";
import challanRouter from "./challan.route";
import reportRouter from "./report.route";
import scrapRouter from "./scrap.route";
import faultyRouter from "./faulty.route";
import uomRouter from "./uom.route";

const routes = Router();

// auth route
routes.use("/auth", authRouter);

// user route
routes.use("/user", verifyAuthToken, userRouter);

// branch route
routes.use("/branch", verifyAuthToken, branchRouter);

// category route
routes.use("/category", verifyAuthToken, cateRouter);

// model route
routes.use("/model", verifyAuthToken, modelRouter);

// item route
routes.use("/item", verifyAuthToken, itemRouter);

// item route
routes.use("/sku-code", verifyAuthToken, skuRouter);

// stock route
routes.use("/stock", verifyAuthToken, stockRouter);

// engineer stock route
routes.use("/engineer-stock", verifyAuthToken, enStockRouter);

// job route
routes.use("/job", verifyAuthToken, jobRouter);

// challan route
routes.use("/challan", verifyAuthToken, challanRouter);

// report
routes.use("/report", verifyAuthToken, reportRouter);

// scrap
routes.use("/scrap", verifyAuthToken, scrapRouter);

// faulty
routes.use("/faulty", verifyAuthToken, faultyRouter);

// uom
routes.use("/uom", verifyAuthToken, uomRouter);

export default routes;
