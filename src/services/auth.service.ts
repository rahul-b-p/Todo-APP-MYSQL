import { errorMessage } from "../constants";
import { FunctionStatus } from "../enums";
import { IUser } from "../interfaces";
import { signAccessToken, signRefreshToken } from "../jwt";
import { User } from "../models";
import { TokenResonse, UserUpdateArgs } from "../types";
import { logFunctionInfo } from "../utils";
import { updateUserById } from "./user.service";


/**
 * To sign tokens, and save refresh token
 */
export const signNewTokens = async (userData: IUser): Promise<TokenResonse> => {
    const functionName = signNewTokens.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {

        const accessToken = await signAccessToken(userData.id.toString(), userData.role);
        const refreshToken = await signRefreshToken(userData.id.toString(), userData.role);

        const updateRefreshToken: UserUpdateArgs = { refreshToken };
        await updateUserById(userData.id.toString(), updateRefreshToken);

        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer'
        }
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message)
    }
}


/**
 * Checks if a refresh token exists for a user by their unique ID.
 */
export const checkRefreshTokenExistsById = async (id: string, refreshToken: string): Promise<boolean> => {
    const functionName = checkRefreshTokenExistsById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const existingUser = await User.findOne({
            where: { id }
        });

        if (existingUser && existingUser.refreshToken && existingUser.refreshToken == refreshToken) {
            logFunctionInfo(functionName, FunctionStatus.SUCCESS);
            return true;
        }

        return false;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}



/**
 * to sign tokens with verifying account and saving the password
 */
export const verfyAccountAndSignNewTokens = async (userData: IUser): Promise<TokenResonse> => {
    const functionName = verfyAccountAndSignNewTokens.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {

        const accessToken = await signAccessToken(userData.id.toString(), userData.role);
        const refreshToken = await signRefreshToken(userData.id.toString(), userData.role);

        const updateRefreshToken: UserUpdateArgs = { refreshToken, verified: true };
        await updateUserById(userData.id.toString(), updateRefreshToken);

        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer'
        }
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message)
    }
}


export const resetPasswordById = async (id: string, password: string): Promise<void> => {
    const functionName = resetPasswordById.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const updateBody: UserUpdateArgs = { password };

        const updatedUser = await updateUserById(id, updateBody);
        if (!updatedUser) throw new Error(errorMessage.USER_EXISTANCE_FAILURE);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}