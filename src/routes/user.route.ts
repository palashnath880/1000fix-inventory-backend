import { Router } from "express";
import userController from "../controllers/user.controller";

const userRouter = Router();

// post route
userRouter.post(`/`, userController.create);

// get all route
userRouter.get(`/`, userController.get);

// get by  id
userRouter.get(`/:userId`, userController.getById);

// update pwd by admin
userRouter.put(`/update-pwd`, userController.updatePwd);

// put route
userRouter.put(`/:userId`, userController.update);

// delete route
userRouter.delete("/:userId", userController.deleteUser);

export default userRouter;
