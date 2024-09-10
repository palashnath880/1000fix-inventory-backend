import { Router } from "express";
import userRouter from "./user.route";
import branchRouter from "./branch.route";
import cateRouter from "./category.route";

const routes = Router();

// user route
routes.use("/user", userRouter);

// branch route
routes.use("/branch", branchRouter);

// category route
routes.use("/category", cateRouter);

export default routes;
