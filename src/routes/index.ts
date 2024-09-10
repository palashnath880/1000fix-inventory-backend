import { Router } from "express";
import userRouter from "./user.route";
import branchRouter from "./branch.route";
import cateRouter from "./category.route";
import modelRouter from "./model.route";
import itemRouter from "./item.route";
import skuRouter from "./skuCode.route";
import stockRouter from "./stock.route";
import jobRouter from "./job.route";

const routes = Router();

// user route
routes.use("/user", userRouter);

// branch route
routes.use("/branch", branchRouter);

// category route
routes.use("/category", cateRouter);

// model route
routes.use("/model", modelRouter);

// item route
routes.use("/item", itemRouter);

// item route
routes.use("/sku-code", skuRouter);

// stock route
routes.use("/stock", stockRouter);

// stock route
routes.use("/job", jobRouter);

export default routes;
