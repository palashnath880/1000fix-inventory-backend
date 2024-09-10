import { Router } from "express";
import userRouter from "./user.route";
import branchRouter from "./branch.route";

const routes = Router();

// user route
routes.use("/user", userRouter);

// branch route
routes.use("/branch", branchRouter);

// category route
routes.use("/category", branchRouter);

export default routes;
