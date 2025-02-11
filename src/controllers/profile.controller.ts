import { NextFunction, Response } from "express";
import { customRequestWithPayload, IUser } from "../interfaces";
import { AuthenticationError, BadRequestError, ConflictError, ForbiddenError, InternalServerError } from "../errors";
import { errorMessage, responseMessage } from "../constants";
import { logFunctionInfo, logger, sendCustomResponse } from "../utils";
import { FunctionStatus, Roles } from "../enums";
import { deleteUserById, findUserById, findUserDatasById, saveOtp, sendOtpForAccountDeletion, sendUserUpdationNotification, updateUserById, verifyOtp } from "../services";
import { UserUpdateArgs, UserUpdateBody } from "../types";
import { checkEmailValidity, validateEmailUniqueness } from "../validators";



/**
 * Controller Function to get all data of logined user
 */
export const readMyProfile = async (req: customRequestWithPayload, res: Response, next: NextFunction) => {
    const functionName = readMyProfile.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const id = req.payload?.id;
        if (!id) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);

        const userData = await findUserDatasById(id);
        if (!userData) throw new AuthenticationError();

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.PROFILE_FETCHED, userData))
    } catch (error) {
        logFunctionInfo(functionName, FunctionStatus.FAIL);
        next(error);
    }
}


/**
 * Controller function to allow a logged-in user to update their own account details.
 * If the user updates their email,
 * the account will need re-verification to confirm the new email address.
 */
export const updateProfile = async (req: customRequestWithPayload<{}, any, UserUpdateBody>, res: Response, next: NextFunction) => {
    const functionName = updateProfile.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { role, email } = req.body;
        const id = req.payload?.id as string;
        const existingUser = await findUserById(id) as IUser;

        if (role) {
            if (existingUser.role !== Roles.ADMIN) throw new ForbiddenError(errorMessage.INSUFFICIENT_PRIVILEGES);
        }

        let userUpdateArgs;
        let emailAdress;
        let message;
        if (email) {
            const isValidEmail = await checkEmailValidity(email);
            if (!isValidEmail) throw new BadRequestError(errorMessage.INVALID_EMAIL);

            if (email == existingUser.email) throw new BadRequestError(errorMessage.EMAIL_ALREADY_IN_USE);

            const isUniqueEmail = await validateEmailUniqueness(email);
            if (!isUniqueEmail) throw new ConflictError(errorMessage.EMAIL_ALREADY_EXISTS);

            userUpdateArgs = { ...req.body, verified: false, refreshToken: null } as UserUpdateArgs;
            emailAdress = [email, existingUser.email] as string[];
            message = `${responseMessage.PROFILE_UPDATED}, ${responseMessage.EMAIL_VERIFICATION_REQUIRED}` as string;
        }
        else {
            userUpdateArgs = { ...req.body } as UserUpdateArgs;
            emailAdress = [] as string[];
            message = responseMessage.PROFILE_UPDATED as string;
        }
        const updatedUser = await updateUserById(id, userUpdateArgs);
        if (updatedUser) {
            Promise.all(emailAdress.map((adress) => {
                sendUserUpdationNotification(adress, updatedUser, existingUser.email)
            })).catch((err) => {
                logger.error(err);
            })
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({ ...await sendCustomResponse(message, updatedUser), verifyLink: email ? '/auth/login' : undefined });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL);
        next(error);
    }
}


/**
 * Controller functions to request OTP for deleting account
 */
export const profileDeleteRequest = async (req: customRequestWithPayload, res: Response, next: NextFunction) => {
    const functionName = profileDeleteRequest.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const id = req.payload?.id;
        if (!id) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);

        const userData = await findUserById(id);
        if (!userData) throw new AuthenticationError();

        const { mailInfo, otp } = await sendOtpForAccountDeletion(userData.email);
        logger.info(mailInfo);
        if (mailInfo.accepted.length <= 0) throw new Error(errorMessage.EMAIL_VALIDATION_FAILED);

        await saveOtp(otp, userData.id);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({
            message: responseMessage.OTP_SENT_FOR_EMAIL_VERIFICATION,
            emailSent: true
        });
    } catch (error) {
        logFunctionInfo(functionName, FunctionStatus.FAIL);
        next(error);
    }
}


/**
 * Controller Function to verify and delete profile by validating otp
 */
export const verifyAndDeleteProfile = async (req: customRequestWithPayload<{}, any, any, { otp: string }>, res: Response, next: NextFunction) => {
    const functionName = verifyAndDeleteProfile.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const id = req.payload?.id;
        if (!id) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);

        const userData = await findUserById(id);
        if (!userData) throw new AuthenticationError();

        const { otp } = req.query;
        const isValidOtp = await verifyOtp(id, otp);
        if (!isValidOtp) throw new AuthenticationError(errorMessage.INVALID_OTP);

        const isDeleted = await deleteUserById(id);
        if (!isDeleted) throw new InternalServerError(errorMessage.USER_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.ACCOUNT_DELETED));
    } catch (error) {
        logFunctionInfo(functionName, FunctionStatus.FAIL);
        next(error);
    }
}