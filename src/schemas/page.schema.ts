import { z } from "zod";
import { errorMessage } from "../constants";
import { pageNumberRegex } from "../config";



export const pageNoSchema = z.string({ message: errorMessage.PAGE_NUMBER_REQUIRED }).regex(pageNumberRegex, errorMessage.PAGE_NUMBER_MUST_BE_DIGITS);

export const pageLimitSchema = z.string({ message: errorMessage.PAGE_LIMIT_REQUIRED }).regex(pageNumberRegex, errorMessage.PAGE_LIMIT_MUST_BE_DIGITS);