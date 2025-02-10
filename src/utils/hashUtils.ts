import bcrypt from 'bcrypt';
import { HASH_SALT_ROUNDS } from '../config';
import { logFunctionInfo } from './logger';
import { FunctionStatus } from '../enums';


/**
 * Hashes a given password using bcrypt with a salt for added security.
 */
export const hashPassword = async (password: string): Promise<string> => {
    const functionName = hashPassword.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        const salt = await bcrypt.genSalt(Number(HASH_SALT_ROUNDS));
        const hashPass = await bcrypt.hash(password, salt);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return hashPass;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
};


/**
 * Compares a plain text password with a hashed password to check if they match.
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {

    const functionName = comparePassword.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return isValidPassword;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
};