import { Router } from "express";
import modelController from "../controllers/model.controller";

const modelRouter = Router();

// post
modelRouter.post(`/`, modelController.create);

// get
modelRouter.get(`/`, modelController.get);

// delete
modelRouter.delete(`/:modelId`, modelController.deleteModel);

export default modelRouter;
