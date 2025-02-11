import { deleteExpiredOtps } from "../database";
import { FunctionStatus } from "../enums";
import { Otp } from "../models";
import { logFunctionInfo } from "../utils"



/**
 * Generates an OTP for the given user and saves it in the database with a 5-minute expiration time.
 */
export const saveOtp = async (otp: string, userId: string): Promise<string> => {
    const functionName = saveOtp.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        await deleteExpiredOtps();

        const newOtp = await Otp.create({ userId, otp })

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return newOtp.otp;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}


/**
 * Generates an OTP for the given user and saves it in the database with a 5-minute expiration time.
 */
export const verifyOtp = async (userId: string, otp: string): Promise<boolean> => {
    const functionName = verifyOtp.name;
    logFunctionInfo(functionName, FunctionStatus.START);
    try {
        await deleteExpiredOtps();

        const existingOtp = await Otp.findOne({
            where: { userId, otp }
        });

        if (existingOtp) {
            await Otp.destroy({
                where: { id: existingOtp.id }
            });
        }

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return existingOtp !== null;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);
        throw new Error(error.message);
    }
}