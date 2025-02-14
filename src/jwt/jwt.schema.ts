import { z } from "zod";
import { Unit } from "./jwt.type";
import { secretKeyRegex } from "../config";
import { errorMessage } from "../constants";

const validUnits = Object.values(Unit).flatMap((unit) => [
    unit,
    unit.toUpperCase(),
    unit.toLowerCase(),
]);

export const secretKeySchema = z
    .string()
    .min(16, errorMessage.SECRET_KEY_MIN_LENGTH)
    .max(64, errorMessage.SECRET_KEY_MAX_LENGTH)
    .regex(secretKeyRegex, errorMessage.SECRET_KEY_ALPHANUMERIC);


export const expirationSchema = z.union([
    // Case 1: Numeric string only
    z.string().regex(/^\d+$/, errorMessage.MUST_BE_NUMERIC_STRING),

    // Case 2: Number followed directly by a unit (no space)
    z.string().refine((val) => {
        const numericPart = val.match(/^\d+/)?.[0]; // Extract numeric prefix
        const unitPart = val.replace(numericPart || "", ""); // Extract remaining as unit
        return (
            numericPart !== undefined && // Ensure numeric part exists
            validUnits.includes(unitPart) // Ensure unit is valid
        );
    }, {
        message: errorMessage.INVALID_EXPRATION_STRING,
    }),

    // Case 3: Number followed by a space and a unit
    z.string().refine((val) => {
        const [numericPart, unitPart] = val.split(" "); // Split into two parts
        return (
            /^\d+$/.test(numericPart) && // Ensure numeric part is valid
            validUnits.includes(unitPart) // Ensure unit part is valid
        );
    }, {
        message: errorMessage.INVALID_EXPRATION_STRING,
    }),
]);