import { config } from "dotenv";
import { errorMessage } from "../constants";

config();



const requiredEnvVariables: string[] = [
    'DB_HOST',
    'DB_NAME',
    'DB_USERNAME',
    'DB_PASSWORD',
    'HASH_SALT_ROUNDS',
    'ADMIN_USERNAME',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'ACCESS_TOKEN_EXPIRATION',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_EXPIRATION',
    'REFRESH_TOKEN_SECRET',
    'HOST_EMAIL_ID',
    'HOST_EMAIL_PASSKEY'
];

// Throwing application error, to exist from process when env variables are not assigned
requiredEnvVariables.forEach((envVar) => {
    if (!process.env[envVar]) {
        const { ENV_ACKNOWLEDGE, REQUIRED_ENV_MISSING } = errorMessage;
        const envMissingError = new Error();
        envMissingError.message = ENV_ACKNOWLEDGE;
        envMissingError.stack = envVar;
        envMissingError.name = REQUIRED_ENV_MISSING
        throw envMissingError;
    }
});


// exporting all env variables
export const DB_HOST = process.env.DB_HOST as string;
export const DB_NAME = process.env.DB_NAME as string;
export const DB_USERNAME = process.env.DB_USERNAME as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;


export const HASH_SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS) as number;

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME as string;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

export const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION as string;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

export const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const HOST_EMAIL_ID = process.env.HOST_EMAIL_ID as string;
export const HOST_EMAIL_PASSKEY = process.env.HOST_EMAIL_PASSKEY as string;