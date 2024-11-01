import { Router } from "express";
import authController from "../controllers/auth.controller";
import { verifyAuthToken } from "../middlewares/verifyToken";

const authRouter = Router();

// login route
authRouter.post(`/login`, authController.login);

// user route
authRouter.post(`/user`, verifyAuthToken, authController.loadUser);

// change password route
authRouter.post(
  `/change-password`,
  verifyAuthToken,
  authController.changePassword
);

// update reset password
authRouter.post(`/update-reset-pwd`, authController.updateResetPass);

// send reset link
authRouter.post(`/send-reset-link`, authController.sendPwdResetLink);

export default authRouter;
