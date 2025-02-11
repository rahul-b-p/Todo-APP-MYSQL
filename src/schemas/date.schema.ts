import { z } from "zod";
import { errorMessage } from "../constants";
import { HHMMregex, YYYYMMDDregex } from "../config";



export const dueDateSchema = z.string({
    message: errorMessage.DUE_DATE_REQUIRED,
}).regex(
    YYYYMMDDregex,
    errorMessage.INVALID_DATE_FORMAT
).refine((dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);

    const date = new Date(year, month - 1, day);
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}, errorMessage.INVALID_DATE).transform((dateStr) => {
    return dateStr;
});

export const dueTimeSchema = z.string(({
    message: errorMessage.DUE_TIME_REQUIRED
})).regex(HHMMregex, {
    message: errorMessage.INVALID_DUE_TIME
});