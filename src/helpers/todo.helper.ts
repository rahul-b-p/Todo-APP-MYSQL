import { FetchType, FunctionStatus } from "../enums";
import { CompletedStatus } from "../enums/todo.enum";
import { TimeInHHMM, TodoFilterQuery, UpdateTodoArgs, UpdateTodoBody, YYYYMMDD } from "../types";
import { logFunctionInfo, logger } from "../utils";
import { getDateFromStrings, getDayRange } from "./date.helper";
import { errorMessage } from "../constants";
import { ITodo } from "../interfaces";
import { Op } from "sequelize";



/**
 * To get filter to use in match aggregation pipline in Todo 
 */
export const getTodoFilter = (fetchType: FetchType, query: Omit<TodoFilterQuery, 'pageNo' | 'pageLimit'>): Record<string, any> => {
    logFunctionInfo(getTodoFilter.name, FunctionStatus.START);
    const { status, userId, dueAt, title } = query;
    let filter: Record<string, any> = {};


    if (fetchType == FetchType.ACTIVE) {
        filter.isDeleted = false;
    }

    if (fetchType == FetchType.TRASH) {
        filter.isDeleted = true;
    }

    if (userId) {
        filter.userId = userId;
    }
    if (status) {
        if (status == CompletedStatus.COMPLETE) {
            filter.completed = true;
        }
        else {
            filter.completed = false;
        }

    }
    if (dueAt) {
        const dayRange = getDayRange(dueAt);
        filter.dueAt = { $gte: dayRange[0], $lte: dayRange[1] };
    }
    if (title) {
        filter.title = { [Op.like]: `%${title}%` };
    }

    logger.info(filter);
    return filter;
}


/**
 * To update dateFeild with changing date and hours
 */
export const updateTodoDueAt = (dateFeild: Date, dateString?: YYYYMMDD, timeString?: TimeInHHMM): Date => {
    logFunctionInfo(updateTodoDueAt.name, FunctionStatus.START);

    if (dateString && timeString) {
        return getDateFromStrings(dateString, timeString);
    }

    else if (dateString) {
        const timeString = dateFeild.toString().split(' ')[4].slice(0, 5) as TimeInHHMM;
        return getDateFromStrings(dateString, timeString);
    }

    else if (timeString) {
        const dateString = dateFeild.toISOString().slice(0, 10) as YYYYMMDD;
        return getDateFromStrings(dateString, timeString);
    }

    else throw new Error(errorMessage.UNWANTED_DATE_UPDATE)

}


/**
 * To get feilds for update in proper format
 */
export const getTodoUpdateArgs = (updateBody: UpdateTodoBody, existingTodo: ITodo): UpdateTodoArgs => {
    logFunctionInfo(getTodoUpdateArgs.name, FunctionStatus.START);

    const { dueDate, dueTime, ...restTodoUpdateBody } = updateBody;

    if (dueDate || dueTime) {
        const dueAt = updateTodoDueAt(existingTodo.dueAt, dueDate, dueTime);
        return { dueAt, ...restTodoUpdateBody }
    }

    return restTodoUpdateBody;
}