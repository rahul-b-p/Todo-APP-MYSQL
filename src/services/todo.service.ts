import { errorMessage } from "../constants";
import { FetchType, FunctionStatus } from "../enums";
import { convertTodoToShow, getDateFromStrings, getPaginationParams, getTodoFilter, getTodoSortArgs } from "../helpers";
import { ITodo } from "../interfaces";
import { Todo, User } from "../models";
import { InsertTodoArgs, TodoFetchResult, TodoFilterQuery, TodoToShow, UpdateTodoArgs } from "../types";
import { logFunctionInfo, logger } from "../utils";



/**
 * TO insert a new todo
*/
export const insertTodo = async (userId: number, todoToInsert: InsertTodoArgs): Promise<ITodo> => {
    const functionName = insertTodo.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        let { dueDate, dueTime, description, title } = todoToInsert;
        const dueAt = getDateFromStrings(dueDate, dueTime);

        const newTodo = await Todo.create({
            title,
            description,
            userId,
            dueAt
        });

        const todoWithoutFlags = newTodo.get({ plain: true });
        delete (todoWithoutFlags as any).isDeleted
        delete (todoWithoutFlags as any).deletedAt

        logFunctionInfo(functionName, FunctionStatus.SUCCESS)
        return todoWithoutFlags;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * To aggregate todo filter count
*/
export const getTodoFilterCount = async (filter: Record<string, string>): Promise<number> => {
    logFunctionInfo(getTodoFilterCount.name, FunctionStatus.START);

    try {
        return await Todo.count({ where: filter });
    } catch (error) {
        throw error;
    }
}


/**
 * To aggreagate user by filter,search, sort and pagenating
 */
export const filterTodos = async (filter: Record<string, any>, sort: Record<string, any>, skip: number, limit: number): Promise<TodoToShow[]> => {
    logFunctionInfo(filterTodos.name, FunctionStatus.START)
    try {
        const todos = await Todo.findAll({
            where: filter,
            order: [[sort.key, sort.order]],  // Dynamic sorting, assuming `sort` contains { key, order }
            offset: skip,
            limit: limit,
            attributes: { exclude: ['isDeleted', 'deletedAt'] },
            include: [
                {
                    model: User,
                    as: 'user', // Alias for the association
                    attributes: [['id', 'userId'], 'username', 'email', 'role'] // Only include specific fields from the User model
                }
            ]
        });

        logFunctionInfo(filterTodos.name, FunctionStatus.SUCCESS);
        return todos.map(todo => convertTodoToShow(todo));
    } catch (error) {
        throw error;
    }
}


/**
 * To fetch todos with serach, filter, sort and pagenation
 */
export const fetchTodos = async (fetchType: FetchType, query: TodoFilterQuery): Promise<TodoFetchResult | null> => {
    const functionName = fetchTodos.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { sortKey, pageLimit, pageNo, ...matchQuery } = query;

        const filter = getTodoFilter(fetchType, matchQuery);
        const { page, limit, skip } = getPaginationParams(pageNo, pageLimit);
        const sort = JSON.parse(getTodoSortArgs(sortKey));

        const totalItems = await getTodoFilterCount(filter)

        const allTodos: TodoToShow[] = await filterTodos(filter, sort, skip, limit)

        const totalPages = Math.ceil(totalItems / limit);
        const fetchResult: TodoFetchResult = {
            page,
            pageSize: limit,
            totalPages,
            totalItems,
            data: allTodos
        }
        return allTodos.length > 0 ? fetchResult : null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * To find todo using its unique id
 */
export const findTodoById = async (fetchType: FetchType, id: string): Promise<ITodo | null> => {
    const functionName = findTodoById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const query: Record<string, any> = { id };
        if (fetchType == FetchType.ACTIVE) {
            query.isDeleted = false;
        }
        if (fetchType == FetchType.TRASH) {
            query.isDeleted = true;
        }
        const todo = await Todo.findOne({ where: query });

        if (todo) logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return todo;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error);
    }
}


/**
 * to update todo by its unique id
 */
export const updateTodoById = async (id: string, updateBody: UpdateTodoArgs): Promise<ITodo | null> => {
    const functionName = updateTodoById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const updatedStatus = await Todo.update(updateBody, {
            where: { id }
        });

        if (updatedStatus[0] < 1) return null;

        const updatedTodo = await Todo.findOne({
            where: { id },
            attributes: { exclude: ['isDeleted', 'deletedAt'] }
        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return updatedTodo as ITodo;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error);
    }
}


/**
 * to update todo by its unique id
 */
export const softDeleteTodoById = async (id: string): Promise<Date | undefined | null> => {
    const functionName = softDeleteTodoById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const SoftDeletionStatus = await Todo.update({
            isDeleted: true,
            deletedAt: new Date()
        }, {
            where: { id }
        });

        if (SoftDeletionStatus[0] < 1) return null;

        const softDeletedTodo = await Todo.findOne({
            where: { id }
        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return softDeletedTodo?.deletedAt;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error);
    }
}


/**
 * To fetch Todo with all related feilds using its unique id
 */
export const fetchTodoDataById = async (_id: string): Promise<TodoToShow | null> => {
    const functionName = fetchTodoDataById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const todo = await Todo.findOne({
            where: { id: _id, isDeleted: false },
            attributes: { exclude: ['isDeleted', 'deletedAt'] },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password', 'refreshToken', 'createdAt', 'updatedAt'] }
                }
            ]
        });

        if (!todo) return null;

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return convertTodoToShow(todo);
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * To restore soft deleted todo using its unique id
 */
export const restoreSoftDeletedTodoById = async (id: string): Promise<ITodo | null> => {
    const functionName = softDeleteTodoById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const restorationStatus = await Todo.update({
            isDeleted: false,
            deletedAt: null
        }, {
            where: { id }
        });

        if (restorationStatus[0] < 1) return null;

        const restoredTodo = await Todo.findOne({
            where: { id }
        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return restoredTodo;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error);
    }
}


/**
 * To delete todo permently,by its unique id
 */
export const deleteTodoById = async (id: string): Promise<boolean> => {
    const functionName = deleteTodoById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const deleteTodo = await Todo.destroy({
            where: { id, isDeleted: true }
        });

        if (deleteTodo == 0) throw new Error(errorMessage.TODO_NOT_FOUND);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return true;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error);
    }
}
