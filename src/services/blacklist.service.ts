import { deleteExpiredTokens } from "../database";
import { FunctionStatus } from "../enums";
import { IBlackList } from "../interfaces";
import { TokenPayload } from "../jwt";
import { Blacklist } from "../models";
import { logFunctionInfo } from "../utils";
import jwt from 'jsonwebtoken';


/**
 * Checks the given token is blacklisted or not
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const functionName = isTokenBlacklisted.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        await deleteExpiredTokens();
        const existOnBlacklist = await Blacklist.findOne({
            where: { token }
        });
        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return existOnBlacklist !== null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}

/**
 * Black list the given token until its expiration time
 */
export const blacklistToken = async (token: string): Promise<IBlackList> => {
    const functionName = blacklistToken.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const { exp } = jwt.decode(token) as TokenPayload;
        const expireAt = new Date(exp * 1000);
        const blacklistedToken = await Blacklist.create({ token, expireAt });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return blacklistedToken;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}