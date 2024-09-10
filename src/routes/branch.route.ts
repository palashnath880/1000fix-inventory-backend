import { Router } from "express";
import branchController from "../controllers/branch.controller";

const branchRouter = Router();

// post route
branchRouter.post(`/`, branchController.create);

// get all route
branchRouter.get(`/`, branchController.get);

// get by  id
// branchRouter.get(`/:userId`, userController.getById);

// put route
branchRouter.put(`/:branchId`, branchController.update);

// delete route
branchRouter.delete("/:branchId", branchController.deleteBranch);

export default branchRouter;
