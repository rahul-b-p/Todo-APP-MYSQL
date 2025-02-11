import { FunctionStatus, Roles } from "../enums";
import { IUser } from "../interfaces";
import { User } from "../models";
import { UserInsertArgs, UserUpdateArgs } from "../types";
import { hashPassword, logFunctionInfo } from "../utils";




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
        user.password = await hashPassword(user.password);

        if (!user.role) {
            user.role = Roles.USER;
        }

        const { email, password, username, role } = user
        const newUser = await User.create({ email, password, username, role })

        // Hiding sensitive fields
        const userWithoutSensitiveInfo = newUser.get({ plain: true });
        delete (userWithoutSensitiveInfo as any).password;
        delete (userWithoutSensitiveInfo as any).refreshToken;

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
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    const functionName = findUserByEmail.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const user = await User.findOne({
            where: { email }
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

        delete (updatedUser as any).password;
        delete (updatedUser as any).refreshToken;


        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return updatedUser as IUser;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
};
