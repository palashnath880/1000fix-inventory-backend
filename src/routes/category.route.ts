import { Router } from "express";
import categoryController from "../controllers/category.controller";

const categoryRouter = Router();

// post route
categoryRouter.post(`/`, categoryController.create);

// get route
categoryRouter.get(`/`, categoryController.get);

// delete route
categoryRouter.delete(`/:categoryId`, categoryController.deleteCategory);

export default categoryRouter;
