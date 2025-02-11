import { NextFunction, Request, Response } from "express";
import { UserAuthBody, UserPasswordResetBody, UserSignUpBody, VerifyUserBody } from "../types";
import { FunctionStatus } from "../enums";
import { logFunctionInfo, logger, sendCustomResponse } from "../utils";
import { blacklistToken, findUserByEmail, findUserById, insertUser, isValidPassword, resetPasswordById, saveOtp, sendEmailVerificationMail, sendOtpForPasswordReset, signNewTokens, updateUserById, verfyAccountAndSignNewTokens, verifyOtp } from "../services";
import { AuthenticationError, BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../errors";
import { errorMessage, responseMessage } from "../constants";
import { checkEmailValidity, validateEmailUniqueness } from "../validators";
import { customRequestWithPayload } from "../interfaces";


/**
 * Controller function to handle the user login request.
 * Send OTP to registered email, if the account not verified, usually on first time login
 */
export const login = async (req: Request<{}, any, UserAuthBody>, res: Response, next: NextFunction) => {
    const functionName = login.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { email, password } = req.body;

        const existingUser = await findUserByEmail(email);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        const isVerifiedPassword = await isValidPassword(existingUser, password);
        if (!isVerifiedPassword) throw new AuthenticationError(errorMessage.INVALID_PASSWORD);

        if (!existingUser.verified) {

            const { mailInfo, otp } = await sendEmailVerificationMail(existingUser.email);
            logger.info(mailInfo);
            if (mailInfo.accepted.length <= 0) throw new Error(errorMessage.EMAIL_VALIDATION_FAILED);

            await saveOtp(otp, existingUser.id);
            logFunctionInfo(functionName, FunctionStatus.PENDING, responseMessage.OTP_SENT_FOR_EMAIL_VERIFICATION);
            res.status(200).json({
                message: responseMessage.OTP_SENT_FOR_EMAIL_VERIFICATION,
                emailSent: true
            });
            return;
        }

        const tokens = await signNewTokens(existingUser);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.statusMessage = "Login Successful";
        res.status(200).json(await sendCustomResponse(responseMessage.SUCCESS_LOGIN, { tokens }));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error)
    }
}


/**
 * Controller Function to sign up as user
 */
export const signUp = async (req: Request<{}, any, UserSignUpBody>, res: Response, next: NextFunction) => {
    const functionName = signUp.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { email } = req.body;

        const isValidEmail = await checkEmailValidity(email);
        if (!isValidEmail) throw new BadRequestError(errorMessage.INVALID_EMAIL);

        const isUniqueEmail = await validateEmailUniqueness(email);
        if (!isUniqueEmail) throw new ConflictError(errorMessage.EMAIL_ALREADY_EXISTS);

        const newUser = await insertUser(req.body);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.SUCCESS_SIGNUP, newUser));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to handle the token refresh request.
 */
export const refresh = async (req: customRequestWithPayload, res: Response, next: NextFunction) => {
    const functionName = refresh.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const id = req.payload?.id;
        if (!id) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);

        const existingUser = await findUserById(id);
        if (!existingUser) throw new InternalServerError(errorMessage.AUTHORIZATION_FAILED);

        const tokens = await signNewTokens(existingUser);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.TOKEN_REFRESHED, { tokens }));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to handle the user logout request.
 */
export const logout = async (req: customRequestWithPayload, res: Response, next: NextFunction) => {
    const functionName = logout.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const id = req.payload?.id;
        if (!id) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);

        const AccessToken = req.headers.authorization?.split(' ')[1];
        if (!AccessToken) throw new InternalServerError(errorMessage.ACCESSTOKEN_MISSING);

        const existingUser = await findUserById(id);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        await blacklistToken(AccessToken);
        if (existingUser.refreshToken) {
            await blacklistToken(existingUser.refreshToken);
            await updateUserById(existingUser.id.toString(), { refreshToken: null });
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.SUCCESS_LOGOUT));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to handle verify account and login  by otp validation.
 */
export const verifyAndLogin = async (req: Request<{}, any, VerifyUserBody>, res: Response, next: NextFunction) => {
    const functionName = verifyAndLogin.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { otp, email } = req.body;

        const existingUser = await findUserByEmail(email);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        const isValidOtp = await verifyOtp(existingUser.id.toString(), otp);
        if (!isValidOtp) throw new AuthenticationError(errorMessage.INVALID_OTP);

        const tokens = await verfyAccountAndSignNewTokens(existingUser);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.statusMessage = "Login Successful";
        res.status(200).json(await sendCustomResponse(responseMessage.SUCCESS_LOGIN, { tokens }));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to handle the user forgot password request, and generates OTP.
 * The resetPassword feature should be used to complete the password reset process.
 */
export const forgotPassword = async (req: Request<{}, any, { email: string }>, res: Response, next: NextFunction) => {
    const functionName = forgotPassword.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { email } = req.body;

        const existingUser = await findUserByEmail(email);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        const { mailInfo, otp } = await sendOtpForPasswordReset(existingUser.email);
        logger.info(mailInfo);
        if (mailInfo.accepted.length <= 0) throw new Error(errorMessage.EMAIL_VALIDATION_FAILED);

        await saveOtp(otp, existingUser.id);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({
            message: responseMessage.OTP_SENT_FOR_EMAIL_VERIFICATION,
            emailSent: true
        });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to reset the user password by OTP validation
 * The forgotPassword function should be used to generate and send the OTP to the user.
 */
export const resetPassword = async (req: Request<{}, any, UserPasswordResetBody>, res: Response, next: NextFunction) => {
    const functionName = resetPassword.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const { otp, email, confirmPassword } = req.body;

        const existingUser = await findUserByEmail(email);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        const isValidOtp = await verifyOtp(existingUser.id.toString(), otp);
        if (!isValidOtp) throw new AuthenticationError(errorMessage.INVALID_OTP);

        await resetPasswordById(existingUser.id.toString(), confirmPassword);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.PASSWORD_UPDATED));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}