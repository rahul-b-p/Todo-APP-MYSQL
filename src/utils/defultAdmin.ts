import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } from "../config";
import { errorMessage } from "../constants";
import { FunctionStatus, Roles } from "../enums";
import { createUserSchema } from "../schemas";
import { insertUser, isAdminExists } from "../services";
import { UserInsertArgs } from "../types";
import { checkEmailValidity, validateEmailUniqueness } from "../validators";
import { logFunctionInfo } from "./logger";


/**
 * To Create Default Admin on the system using credensials in environment
 */
export const createDefultAdmin = async (): Promise<void> => {
    const functionName = createDefultAdmin.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const isAdminExistOnSystem = await isAdminExists();
        if (isAdminExistOnSystem) {
            logFunctionInfo(functionName, FunctionStatus.TERMINATED, 'The System already have an Admin');
            return;
        }

        const newAdmin: UserInsertArgs = {
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: Roles.ADMIN
        }

        createUserSchema.parse(newAdmin);

        const isValidEmail = await checkEmailValidity(newAdmin.email);
        if (!isValidEmail) throw new Error(errorMessage.INVALID_EMAIL);

        const isUniqueEmailOnSystem = await validateEmailUniqueness(newAdmin.email);
        if (!isUniqueEmailOnSystem) throw new Error(errorMessage.EMAIL_ALREADY_EXISTS);

        const insertedAdmin = await insertUser(newAdmin);
        logFunctionInfo(functionName, FunctionStatus.SUCCESS, `Created new Admin :${insertedAdmin}`);
        return;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new (error.message);
    }
}