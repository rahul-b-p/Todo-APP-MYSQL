import { DateStatus, FunctionStatus } from "../enums";
import { DateRange, TimeInHHMM, YYYYMMDD } from "../types";
import { logFunctionInfo } from "../utils";
import { errorMessage } from "../constants";



/**
 * To get Date from date and tiime strings
 */
export const getDateFromStrings = (dateString: YYYYMMDD, timeString: TimeInHHMM): Date => {
    logFunctionInfo(getDateFromStrings.name, FunctionStatus.START);
    const time = timeString.split(':');
    const hours = Number(time[0]);
    const minutes = Number(time[1]);

    const date = new Date(dateString);
    date.setHours(hours, minutes);
    return date;
}


/**
 * To compare inputed date with current date
 * @returns the status as `past`, `present` or `future`
*/
export const compareDatesWithCurrentDate = (inputDate: YYYYMMDD): DateStatus => {
    logFunctionInfo(compareDatesWithCurrentDate.name, FunctionStatus.START);

    const date = new Date(inputDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (currentDate > date) {
        return DateStatus.Past;
    } else if (currentDate < date) {
        return DateStatus.Future;
    } else {
        return DateStatus.Present;
    }
};


/**
 * Returns the start and end of the given day as a range as array `[ start, end ]`.
 */
export const getDayRange = (dateString: YYYYMMDD): DateRange => {
    const functionName = getDayRange.name;
    logFunctionInfo(functionName, FunctionStatus.START);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        logFunctionInfo(functionName, FunctionStatus.FAIL);
        throw new Error(errorMessage.INVALID_DATE_FORMAT);
    }

    const date = new Date(dateString);

    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    logFunctionInfo(functionName, FunctionStatus.SUCCESS);
    return [start, end] as DateRange;
}