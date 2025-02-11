import { NextFunction, Response } from "express";
import { customRequestWithPayload } from "../interfaces";
import { logFunctionInfo, sendCustomResponse } from "../utils";
import { DateStatus, FetchType, FunctionStatus, Roles } from "../enums";
import { InsertTodoArgs, TodoFilterQuery, UpdateTodoBody } from "../types";
import { AuthenticationError, BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from "../errors";
import { errorMessage, responseMessage } from "../constants";
import { deleteTodoById, fetchTodoDataById, fetchTodos, findTodoById, findUserById, insertTodo, restoreSoftDeletedTodoById, softDeleteTodoById, updateTodoById } from "../services";
import { compareDatesWithCurrentDate, getTodoUpdateArgs, getPaginationLinks } from "../helpers";
import { isValidUUID } from "../validators";


/**
 * Controller Function to create tod
 */
export const createTodo = async (req: customRequestWithPayload<{}, any, InsertTodoArgs>, res: Response, next: NextFunction) => {
    const functionName = createTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const userId = req.payload?.id;
        if (!userId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);

        const userData = await findUserById(userId);
        if (!userData) throw new AuthenticationError();

        const { dueDate } = req.body;
        const dateStatus = compareDatesWithCurrentDate(dueDate);
        if (dateStatus == DateStatus.Past) throw new BadRequestError(errorMessage.PAST_DATE_NOT_ALLOWED);

        const insertedTodo = await insertTodo(userId, req.body);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.TODO_CREATED, insertedTodo));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller Function to create new todo for given user
 * @protected only admin can access the feature
 * @param userId unique id of user
 */
export const createUserTodo = async (req: customRequestWithPayload<{ userId: string }, any, InsertTodoArgs>, res: Response, next: NextFunction) => {
    const functionName = createUserTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { userId } = req.params;
        const isValidUserId = isValidUUID(userId);
        if (!isValidUserId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingUser = await findUserById(userId);
        if (!existingUser) throw new NotFoundError(errorMessage.USER_NOT_FOUND);

        const { dueDate } = req.body;
        const dateStatus = compareDatesWithCurrentDate(dueDate);
        if (dateStatus == DateStatus.Past) throw new BadRequestError(errorMessage.PAST_DATE_NOT_ALLOWED);

        const insertedTodo = await insertTodo(userId, req.body);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.TODO_CREATED, insertedTodo));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller Function to read all todos 
 *  - Admin can read all todos
 *  - User can read all their own todos
 */
export const readAllTodos = async (req: customRequestWithPayload<{}, any, any, TodoFilterQuery>, res: Response, next: NextFunction) => {
    const functionName = readAllTodos.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const query = req.query;

        if (reqOwner.role !== Roles.ADMIN) {
            if (query.userId) throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);

            query.userId = reqOwnerId;
        }

        const todoFetchResult = await fetchTodos(FetchType.ACTIVE, query);
        const message = todoFetchResult ? responseMessage.TODO_DATA_FETCHED : errorMessage.TODO_DATA_NOT_FOUND;

        let PageNationFeilds;
        if (todoFetchResult) {
            const { data, ...pageInfo } = todoFetchResult
            PageNationFeilds = getPaginationLinks(pageInfo, req.originalUrl);
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({
            success: true, message, ...todoFetchResult, ...PageNationFeilds
        });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller Function to update todo using its unique id
 *  - Admin can update todos
 *  - User can update their own todos
 * @param id unique id of todo
 */
export const updateTodo = async (req: customRequestWithPayload<{ id: string }, any, UpdateTodoBody>, res: Response, next: NextFunction) => {
    const functionName = updateTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const { id } = req.params;
        const isValidTodoId = isValidUUID(id);
        if (!isValidTodoId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingTodo = await findTodoById(FetchType.ACTIVE, id);
        if (!existingTodo) throw new NotFoundError(errorMessage.TODO_NOT_FOUND);

        if (reqOwner.role !== Roles.ADMIN && existingTodo.userId.toString() !== reqOwnerId) {
            throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);
        }

        const todoUpdateArgs = getTodoUpdateArgs(req.body, existingTodo);

        const updatedTodo = await updateTodoById(id, todoUpdateArgs);
        if (!updateTodo) throw new InternalServerError(errorMessage.TODO_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.START);
        res.status(200).json(await sendCustomResponse(responseMessage.TODO_UPDATED, updatedTodo));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller Function to soft delete todo using its unique id
 *  - Admin can delete todos
 *  - User can delete their own todos
 * @param id unique id of todo
 */
export const deleteTodo = async (req: customRequestWithPayload<{ id: string }>, res: Response, next: NextFunction) => {
    const functionName = deleteTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const { id } = req.params;
        const isValidTodoId = isValidUUID(id);
        if (!isValidTodoId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingTodo = await findTodoById(FetchType.ACTIVE, id);
        if (!existingTodo) throw new NotFoundError(errorMessage.TODO_NOT_FOUND);

        if (reqOwner.role !== Roles.ADMIN && existingTodo.userId.toString() !== reqOwnerId) {
            throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);
        }

        const deletedAt = await softDeleteTodoById(id);
        if (!deletedAt) throw new InternalServerError(errorMessage.TODO_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({ ...await sendCustomResponse(responseMessage.TODO_DELETED), deletedAt });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controler function to fetch a todo using its unique id
 * - Admin can fetch any todos
 *  - User can fetch a their own todos
 * @param id unique idof todo
 */
export const readTodoById = async (req: customRequestWithPayload<{ id: string }>, res: Response, next: NextFunction) => {
    const functionName = readTodoById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const { id } = req.params;
        const isValidTodoId = isValidUUID(id);
        if (!isValidTodoId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingTodo = await fetchTodoDataById(id);
        if (!existingTodo) throw new NotFoundError(errorMessage.TODO_NOT_FOUND);

        if (reqOwner.role !== Roles.ADMIN && existingTodo.user.id.toString() !== reqOwnerId) {
            throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.TODO_DATA_FETCHED, existingTodo));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller function to fetch the trash (soft deleted todos)
 *  - Admin can read all todos
 *  - User can read all their own todos
 */
export const readTrashTodos = async (req: customRequestWithPayload<{}, any, any, TodoFilterQuery>, res: Response, next: NextFunction) => {
    const functionName = readTrashTodos.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const query = req.query;

        if (reqOwner.role !== Roles.ADMIN) {
            if (query.userId) throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);

            query.userId = reqOwnerId;
        }

        const todoFetchResult = await fetchTodos(FetchType.TRASH, query);
        const message = todoFetchResult ? responseMessage.TRASH_TOD0_FETCHED : errorMessage.EMPTY_TRASH;

        let PageNationFeilds;
        if (todoFetchResult) {
            const { data, ...pageInfo } = todoFetchResult
            PageNationFeilds = getPaginationLinks(pageInfo, req.originalUrl);
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json({
            success: true, message, ...todoFetchResult, ...PageNationFeilds
        });
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller Function to restore trash todo 
 *  - Admin can restore any trash todos
 *  - User can restore  their trash todos
 * @param id unique id of todo
*/
export const restoreTodo = async (req: customRequestWithPayload<{ id: string }>, res: Response, next: NextFunction) => {
    const functionName = restoreTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const { id } = req.params;
        const isValidTodoId = isValidUUID(id);
        if (!isValidTodoId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingTrashTodo = await findTodoById(FetchType.TRASH, id);
        if (!existingTrashTodo) throw new NotFoundError(errorMessage.TODO_NOT_FOUND_IN_TRASH);

        if (reqOwner.role !== Roles.ADMIN && existingTrashTodo.userId.toString() !== reqOwnerId) {
            throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);
        }

        const restoredTodo = await restoreSoftDeletedTodoById(id);
        if (!restoredTodo) throw new InternalServerError(errorMessage.TODO_NOT_FOUND_IN_TRASH);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.RESTORED_TODO, restoredTodo));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}


/**
 * Controller Function to delete todo from trash
 * Item will be permenantly deleted
 *  - Admin can delete todos
 *  - User can delete their own todos
 * @param id unique id of todo
 */
export const deleteTrashTodo = async (req: customRequestWithPayload<{ id: string }>, res: Response, next: NextFunction) => {
    const functionName = deleteTrashTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const reqOwnerId = req.payload?.id;
        if (!reqOwnerId) throw new InternalServerError(errorMessage.NO_USER_ID_IN_PAYLOAD);
        const reqOwner = await findUserById(reqOwnerId);
        if (!reqOwner) throw new AuthenticationError();

        const { id } = req.params;
        const isValidTodoId = isValidUUID(id);
        if (!isValidTodoId) throw new BadRequestError(errorMessage.INVALID_ID);

        const existingTrashTodo = await findTodoById(FetchType.TRASH, id);
        if (!existingTrashTodo) throw new NotFoundError(errorMessage.TODO_NOT_FOUND_IN_TRASH);

        if (reqOwner.role !== Roles.ADMIN && existingTrashTodo.userId.toString() !== reqOwnerId) {
            throw new ForbiddenError(errorMessage.UNAUTHORIZED_TODO_ACCESS);
        }

        const isDeleted = await deleteTodoById(id);
        if (!isDeleted) throw new InternalServerError(errorMessage.TODO_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        res.status(200).json(await sendCustomResponse(responseMessage.TRAH_TODO_DELETED));
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        next(error);
    }
}