import { winstonLogger } from "../config";
import { FunctionStatus } from "../enums";



// seting the logger with winston logger configuration
export const logger = winstonLogger;

/**
 * logs Function Information
*/
export const logFunctionInfo = (functionName: string, functionStatus: FunctionStatus, details?: string): void => {
    const logData = `Function: ${functionName}, Status: ${functionStatus} ${details ? ', Details: ' + details : ''}`;
    if (functionStatus == FunctionStatus.FAIL) {
        logger.error(logData)
    }
    else {
        logger.info(logData);
    }
}