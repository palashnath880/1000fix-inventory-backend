import { Router } from "express";
import challanController from "../controllers/challan.controller";

const challanRouter = Router();

// post route
challanRouter.post(`/`, challanController.create);

// get by id
challanRouter.get(`/:id`, challanController.getById);

// get all
challanRouter.get(`/`, challanController.getAll);

// delete
challanRouter.delete(`/:id`, challanController.deleteChallan);

export default challanRouter;
