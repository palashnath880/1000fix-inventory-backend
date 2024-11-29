import { Router } from "express";
import authController from "../controllers/auth.controller";
import { isAuthenticate } from "../middleware";

const authRouter = Router();

// login route
authRouter.post(`/login`, authController.login);

// refresh token
authRouter.post(`/refresh-token`, authController.refreshToken);

// change password route
authRouter.post(
  `/change-password`,
  isAuthenticate,
  authController.changePassword
);

// update reset password
authRouter.post(`/update-reset-pwd`, authController.updateResetPass);

// send reset link
authRouter.post(`/send-reset-link`, authController.sendPwdResetLink);

export default authRouter;
