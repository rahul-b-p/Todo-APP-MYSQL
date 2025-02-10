import { z } from "zod";
import { errorMessage } from "../constants";
import { passwordSchema } from "./password.schema";
import { Roles } from "../enums";
import { otpSchema } from "./otp.schema";




export const createUserSchema = z.object({
    username: z.string({ message: errorMessage.INVALID_USERNAME }).min(4, errorMessage.INVALID_USERNAME_LENGTH),
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email(errorMessage.INVALID_EMAIL),
    password: passwordSchema,
    role: z.nativeEnum(Roles, { message: errorMessage.INVALID_ROLE })
}).strict();


export const userLoginSchema = z.object({
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email(errorMessage.INVALID_EMAIL),
    password: passwordSchema,
}).strict();


export const userSignupSchema = z.object({
    username: z.string({ message: errorMessage.INVALID_USERNAME }).min(4, errorMessage.INVALID_USERNAME_LENGTH),
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email(errorMessage.INVALID_EMAIL),
    password: passwordSchema
}).strict();


export const userAccountVerificationSchema = z.object({
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email(errorMessage.INVALID_EMAIL),
    otp: otpSchema
})


export const forgotPasswordSchema = z.object({
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email({ message: errorMessage.INVALID_EMAIL })
}).strict();


export const resetPasswordSchema = z.object({
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email({ message: errorMessage.INVALID_EMAIL }),
    otp: otpSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
}).strict().refine(
    (data) => data.password === data.confirmPassword,
    {
        message: errorMessage.PASSWORDS_MUST_MATCH,
        path: ["confirmPassword"],
    }
);