import { NextFunction, Response } from "express";
import { errorMessage, responseMessage } from "../constants";
import { FunctionStatus } from "../enums";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import { customRequestWithPayload } from "../interfaces";
import { deleteUserById, fetchUsers, findUserById, findUserDatasById, insertUser, sendUserCreationNotification, sendUserUpdationNotification, updateUserById } from "../services";
import { UserFilterQuery, UserInsertArgs, UserUpdateBody } from "../types";
import { logFunctionInfo, logger, sendCustomResponse } from "../utils";
import { checkEmailValidity, validateEmailUniqueness, isValidUUID } from "../validators";
import { getUpdateRequirments, getPaginationLinks } from "../helpers";




/**
 * Controller function to create a new user
 * @protected only admin or manger can access this feature
 * - Create user with any role
 */
export const createUser = async (req: customRequestWithPayload<{}, any, UserInsertArgs>, res: Response, next: NextFunction) => {
    const functionName = createUser.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { email } = req.body;

        const isValidEmail = await checkEmailValidity(email);
        if (!isValidEmail) throw new BadRequestError(errorMessage.INVALID_EMAIL);

        const isUniqueEmail = await validateEmailUniqueness(email);
        if (!isUniqueEmail) throw new ConflictError(errorMessage.EMAIL_ALREADY_EXISTS);

        const newUser = await insertUser(req.body);
        sendUserCreationNotification(newUser).catch((error) => {
            logger.error(error);
        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(201).json(await sendCustomResponse(responseMessage.USER_CREATED, newUser));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to create a new user
 * Filter the Users by roles
 * Search the users by username
 * Sort the users by username, or createdAt
 * @protected only admin can access this feature
 */
export const readAllUsers = async (req: customRequestWithPayload<{}, any, any, UserFilterQuery>, res: Response, next: NextFunction) => {
    const functionName = readAllUsers.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const fetchResult = await fetchUsers(req.query);

        const message = fetchResult ? responseMessage.USER_DATA_FETCHED : errorMessage.USER_DATA_NOT_FOUND;

        let PageNationFeilds;
        if (fetchResult) {
            const { data, ...pageInfo } = fetchResult
            PageNationFeilds = getPaginationLinks(pageInfo, req.originalUrl);
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({
            success: true, message, ...fetchResult, ...PageNationFeilds
        });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to update a user
 * @param id user id
 * @protected only admin can access this feature
 */
export const updateUser = async (req: customRequestWithPayload<{ id: string }, any, UserUpdateBody>, res: Response, next: NextFunction) => {
    const functionName = updateUser.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { email } = req.body;

        const { id } = req.params;
        const isValidUserId = isValidUUID(id);
        if (!isValidUserId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingUser = await findUserById(id);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        if (email) {
            const isValidEmail = await checkEmailValidity(email);
            if (!isValidEmail) throw new BadRequestError(errorMessage.INVALID_EMAIL);

            if (email == existingUser.email) throw new BadRequestError(errorMessage.EMAIL_ALREADY_IN_USE);

            const isUniqueEmail = await validateEmailUniqueness(email);
            if (!isUniqueEmail) throw new ConflictError(errorMessage.EMAIL_ALREADY_EXISTS);

        }

        const updateRequirments = getUpdateRequirments(existingUser.email, req.body);

        const updatedUser = await updateUserById(id, updateRequirments.arguments);
        if (updatedUser && updateRequirments.mailTo) {
            Promise.all(updateRequirments.mailTo.map((adress) => {
                sendUserUpdationNotification(adress, updatedUser, existingUser.email)
            })).catch((err) => {
                logger.error(err);
            })
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({ ...await sendCustomResponse(updateRequirments.message, updatedUser), verifyLink: email ? '/auth/login' : undefined });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to delete a user
 * @param id user id
 * @protected only admin can access this feature
 */
export const deleteUser = async (req: customRequestWithPayload<{ id: string }>, res: Response, next: NextFunction) => {
    const functionName = deleteUser.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const { id } = req.params;
        const isValidUserId = isValidUUID(id);
        if (!isValidUserId) throw new BadRequestError(errorMessage.INVALID_ID);

        const isDeleted = await deleteUserById(id);
        if (!isDeleted) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.USER_DELETED));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to read a specific user
 * @param id user id
 * @protected only admin can access this feature
 */
export const readUserById = async (req: customRequestWithPayload<{ id: string }>, res: Response, next: NextFunction) => {
    const functionName = readUserById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { id } = req.params;
        const isValidUserId = isValidUUID(id);
        if (!isValidUserId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingUser = await findUserDatasById(id);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.USER_DATA_FETCHED, existingUser));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}