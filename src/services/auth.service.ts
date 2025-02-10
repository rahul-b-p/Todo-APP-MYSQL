import { FunctionStatus } from "../enums";
import { User } from "../models";
import {  logFunctionInfo } from "../utils";





/**
 * Checks if a refresh token exists for a user by their unique ID.
 */
export const checkRefreshTokenExistsById = async (id: string, refreshToken: string): Promise<boolean> => {
    const functionName = checkRefreshTokenExistsById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const UserExists = await User.findOne({
            where: { id, refreshToken }
        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return UserExists !== null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}

