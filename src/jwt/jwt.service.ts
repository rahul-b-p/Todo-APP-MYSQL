import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { logFunctionInfo, logger } from '../utils';
import { expirationSchema, secretKeySchema } from './jwt.schema';
import { ZodError } from 'zod';
import { StringValue } from './jwt.type';
import { FunctionStatus } from '../enums';
import { errorMessage } from '../constants';
import { TokenPayload } from './jwt.interface';




/**
 * Function to sign new JWT token with secret and payload
 * */
export const signToken = async (id: string, role: string, secretKey: string, expiration: string): Promise<string> => {

    const functionName = signToken.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        secretKeySchema.parse(secretKey);
        expirationSchema.parse(expiration);
        const token = jwt.sign({ id, role }, secretKey, { expiresIn: expiration as StringValue });
        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return token;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);

        if (error instanceof ZodError) {
            throw new Error(errorMessage.INVALID_SECRET_KEY + error.message);
        }

        if (error instanceof jwt.JsonWebTokenError) {
            logger.error(errorMessage.JWT_SIGNING_FAILED + error.message);
            throw new Error(errorMessage.TOKEN_SIGN_FAILED);
        }

        throw new Error(errorMessage.TOKEN_SIGN_ERROR);
    }
}


/**
 * Function to verify a JWT token
 * */
export const verifyToken = async (token: string, secretKey: string): Promise<TokenPayload | null> => {
    const functionName = verifyToken.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    try {
        secretKeySchema.parse(secretKey);
        const payload = jwt.verify(token, secretKey) as TokenPayload;

        logFunctionInfo(functionName, FunctionStatus.SUCCESS);
        return payload;
    } catch (error: any) {
        logFunctionInfo(functionName, FunctionStatus.FAIL, error.message);

        if (error instanceof ZodError) {
            throw new Error(errorMessage.INVALID_SECRET_KEY + error.message);
        }

        if (error instanceof JsonWebTokenError) {
            logger.warn(errorMessage.INVALID_TOKEN);
        }

        return null;
    }
}