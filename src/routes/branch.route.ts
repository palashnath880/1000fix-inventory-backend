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
branchRouter.put(`/:userId`, branchController.update);

// delete route
branchRouter.delete("/:userId", branchController.deleteBranch);

export default branchRouter;
