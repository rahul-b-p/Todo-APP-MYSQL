import { TodoSortArgs, TodoSortKeys, UserSortArgs, UserSortKeys } from "../enums";


/**
 * Maps user sort arguments from sort keys
*/
export const getUserSortArgs = (sortKey?: UserSortKeys): UserSortArgs => {
    const sortMapping: Record<UserSortKeys, UserSortArgs> = {
        [UserSortKeys.USERNAME]: UserSortArgs.USERNAME,
        [UserSortKeys.CREATE_AT]: UserSortArgs.CREATE_AT,
    };

    return sortMapping[sortKey as UserSortKeys] || UserSortArgs.CREATE_AT;
};


/**
 * Maps todo sort arguments from sort keys
 */
export const getTodoSortArgs = (sortKey?: TodoSortKeys): TodoSortArgs => {
    const sortMapping: Record<TodoSortKeys, TodoSortArgs> = {
        [TodoSortKeys.TITLE]: TodoSortArgs.TITLE,
        [TodoSortKeys.CREATE_AT]: TodoSortArgs.CREATE_AT,
    };

    return sortMapping[sortKey as TodoSortKeys] || TodoSortArgs.CREATE_AT;
};