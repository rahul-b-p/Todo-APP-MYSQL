import { z } from "zod";
import { errorMessage } from "../constants";
import { passwordSchema } from "./password.schema";
import { Roles } from "../enums";




export const createUserSchema = z.object({
    username: z.string({ message: errorMessage.INVALID_USERNAME }).min(4, errorMessage.INVALID_USERNAME_LENGTH),
    email: z.string({ message: errorMessage.EMAIL_REQUIRED }).email(errorMessage.INVALID_EMAIL),
    password: passwordSchema,
    role: z.nativeEnum(Roles, { message: errorMessage.INVALID_ROLE })
}).strict();
