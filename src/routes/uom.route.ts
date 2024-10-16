import { Router } from "express";
import uomController from "../controllers/uom.controller";

const uomRouter = Router();

// post
uomRouter.post(`/`, uomController.create);

// get
uomRouter.get(`/`, uomController.getAll);

// delete
uomRouter.delete(`/:id`, uomController.deleteUOM);

export default uomRouter;
