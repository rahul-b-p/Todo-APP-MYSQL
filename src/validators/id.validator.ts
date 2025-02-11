import validator from 'validator';

import { FunctionStatus } from "../enums"
import { logFunctionInfo } from "../utils"


export const isValidUUID = (id: string):boolean => {
    logFunctionInfo(isValidUUID.name, FunctionStatus.START);

    return validator.isUUID(id)
}