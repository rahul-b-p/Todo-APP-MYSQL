import { Router } from "express";
import { accessTokenAuth, refreshTokenAuth, validateReqBody } from "../middlewares";
import { forgotPasswordSchema, resetPasswordSchema, userAccountVerificationSchema, userLoginSchema, userSignupSchema } from "../schemas";
import { authController } from "../controllers";




export const router = Router();

// API to login
router.post('/login', validateReqBody(userLoginSchema), authController.login);

// API to signup as user(can't signup as an admin)
router.post('/signup', validateReqBody(userSignupSchema), authController.signUp);

// API to refresh tokens
router.post('/refresh', refreshTokenAuth, authController.refresh);

// API ro logout
router.post('/logout', accessTokenAuth, authController.logout);

// API to verify and login by validating otp
router.post('/verify', validateReqBody(userAccountVerificationSchema), authController.verifyAndLogin);

// API to request otp in password forgot,or password reset
router.post('/forgot-password', validateReqBody(forgotPasswordSchema), authController.forgotPassword);

// API to reset password by validating otp
router.put('/reset-password', validateReqBody(resetPasswordSchema), authController.resetPassword);