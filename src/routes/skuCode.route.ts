import { Router } from "express";
import skuCodeController from "../controllers/skuCode.controller";

const skuCodeRouter = Router();

// post
skuCodeRouter.post(`/`, skuCodeController.create);

// get
skuCodeRouter.get(`/`, skuCodeController.get);

// delete
skuCodeRouter.delete(`/:modelId`, skuCodeController.deleteSkuCode);

export default skuCodeRouter;
