import { Router } from "express";
import itemController from "../controllers/item.controller";

const itemRouter = Router();

// post
itemRouter.post(`/`, itemController.create);

// get
itemRouter.get(`/`, itemController.get);

// delete
itemRouter.delete(`/:itemId`, itemController.deleteItem);

export default itemRouter;
