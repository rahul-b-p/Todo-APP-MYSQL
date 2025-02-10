import { z } from "zod";
import { passwordRegex } from "../config";
import { errorMessage } from "../constants";


export const passwordSchema = z.string({ message: errorMessage.PASSWORD_REQUIRED }).refine(
    (password) => passwordRegex.test(password),
    {
        message: errorMessage.INVALID_PASSWORD_FORMAT,
    }
);