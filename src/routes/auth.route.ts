import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRouter = Router();

// login route
authRouter.post(`/login`, authController.login);

// login route
authRouter.post(`/user`, authController.loadUser);

export default authRouter;
