import * as dns from 'dns';
import { logFunctionInfo } from '../utils';
import { FunctionStatus } from '../enums';
import { User } from '../models';



/**
 * Checks the validity of an email address by verifying the existence of its domain's mail exchange (MX) records.
*/
export const checkEmailValidity = (email: string): Promise<boolean> => {
    const functionName = checkEmailValidity.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    return new Promise((resolve, reject) => {
        const domain = email.split('@')[1];
        if (!domain) {
            return resolve(false);
        }

        try {
            dns.resolveMx(domain, (err, addresses) => {
                if (err) {
                    return resolve(false);
                }

                logFunctionInfo(functionName, FunctionStatus.SUCCESS);
                resolve(addresses && addresses.length > 0);
            });
        } catch (error: any) {
            logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
            reject(error)
        }
    });
}


/**
 * Validates the uniqueness of an email by checking if any user is registered with the given email address.
*/
export const validateEmailUniqueness = async (email: string): Promise<boolean> => {
    const functionName = validateEmailUniqueness.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        const emailExists = await User.findOne({
            where: { email },
            attributes: ['id']
        });

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return emailExists === null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}
