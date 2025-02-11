import { FunctionStatus, Roles } from "../enums";
import { getPaginationParams, getUserFilterArguments, getUserSortArgs } from "../helpers";
import { IUser } from "../interfaces";
import { User } from "../models";
import { UserFetchResult, UserFilterQuery, UserInsertArgs, UserToShow, UserUpdateArgs } from "../types";
import { logFunctionInfo } from "../utils";




/**
 * To check if there any admin exists on database
 */
export const isAdminExists = async (): Promise<boolean> => {
    const functionName = isAdminExists.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const adminExists = await User.findOne({
            where: { role: Roles.ADMIN },
            attributes: ['id']
        });

        adminExists && logFunctionInfo(functionName, FunctionStatus.SUCCESS);

        return adminExists !== null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * Inserts a new user with required feilds
*/
export const insertUser = async (user: UserInsertArgs): Promise<IUser> => {
    const functionName = insertUser.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        if (!user.role) {
            user.role = Roles.USER;
        }

        const { email, password, username, role } = user
        const newUser = await User.create({ email, password, username, role })

        // Hiding sensitive fields
        const userWithoutSensitiveInfo = newUser.get({ plain: true });
        delete (userWithoutSensitiveInfo as any).password;

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return userWithoutSensitiveInfo as IUser;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * Finds an existing user by its unique email adress.
*/
export const findUserByEmail = async (email: string): Promise<User | null> => {
    const functionName = findUserByEmail.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const user = await User.scope("withPassword").findOne({
            where: { email },

        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return user;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * Finds a user by its unique ID
 */
export const findUserById = async (id: string): Promise<IUser | null> => {
    const functionName = findUserById.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const user = await User.findOne({
            where: { id }
        });

        if (user) logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return user;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * Updates an existing user data by its unique id.
*/
export const updateUserById = async (id: string, userToUpdate: UserUpdateArgs): Promise<IUser | null> => {
    const functionName = updateUserById.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const updatedStatus = await User.update(userToUpdate, {
            where: { id }
        });
        if (updatedStatus[0] < 1) return null;

        const updatedUser = await User.findOne({
            where: { id }
        });


        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return updatedUser as IUser;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
};


/**
 * To find all usensitive data of a user
 */
export const findUserDatasById = async (id: string): Promise<UserToShow | null> => {
    const functionName = findUserDatasById.name;
    try {
        const user = await User.findOne({
            where: { id }
        });

        if (!user) return null;

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return user as unknown as UserToShow;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
};



/**
 * Delets an existing user data by its unique id.
*/
export const deleteUserById = async (id: string): Promise<boolean> => {
    const functionName = deleteUserById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const deletedUser = await User.destroy({
            where: { id }
        });

        if (deletedUser) logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return deletedUser !== 0;
    } catch (error: any) {

        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * To aggregate filter count using Sequelize
 */
export const getUserFilterCount = async (filter: Record<string, any>): Promise<number> => {
    logFunctionInfo(getUserFilterCount.name, FunctionStatus.START);
    try {
        return await User.count({ where: filter });
    } catch (error) {
        throw error;
    }
};


/**
 * To filter users with search, sort, and pagination using Sequelize
 */
export const filterUsers = async (filter: Record<string, any>, sort: Record<string, string>, skip: number, limit: number): Promise<UserToShow[]> => {
    logFunctionInfo(filterUsers.name, FunctionStatus.START);
    try {
        return await User.findAll({
            where: filter,
            order: [[sort.key, sort.order]],
            offset: skip,
            limit: limit,
        }) as unknown[] as UserToShow[];
    } catch (error) {
        throw error;
    }
};


/**
 * Fetches all users using Sequelize with filtering, sorting, and pagination.
 */
export const fetchUsers = async (query: UserFilterQuery): Promise<UserFetchResult | null> => {
    const functionName = fetchUsers.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { pageNo, pageLimit, sortKey, ...filterFeilds } = query;

        // Build filter conditions
        const filter = getUserFilterArguments(filterFeilds);

        // Get sorting and pagination parameters
        const sort = JSON.parse(getUserSortArgs(sortKey));
        const { limit, page, skip } = getPaginationParams(pageNo, pageLimit);

        // Fetch total count
        const totalItems = await getUserFilterCount(filter);

        // Fetch users
        const users: UserToShow[] = await filterUsers(filter, sort, skip, limit);

        const totalPages = Math.ceil(totalItems / limit);
        const fetchResult: UserFetchResult = {
            page,
            pageSize: limit,
            totalPages,
            totalItems,
            data: users
        };

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return users.length > 0 ? fetchResult : null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
};
