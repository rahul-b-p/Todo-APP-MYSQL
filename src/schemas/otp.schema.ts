import { z } from "zod";

import { errorMessage } from "../constants";
import { otpRegex } from "../config";


export const otpSchema = z.string().regex(otpRegex, {
    message: errorMessage.INVALID_OTP_FORMAT,
});