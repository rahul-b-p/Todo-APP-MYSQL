import { Op } from "sequelize";
import { responseMessage } from "../constants";
import { UserFilters, UserUpdateBody, UserUpdateRequirments } from "../types";


/**
 * To get updation required feilds
 */
export const getUpdateRequirments = (existingEmail: string, updateBody: UserUpdateBody) => {

    let updateReuirments: UserUpdateRequirments = { arguments: {}, message: "" }

    if (updateBody.email) {
        updateReuirments.arguments = { ...updateBody, refreshToken: null, verified: false };
        updateReuirments.mailTo = [existingEmail, updateBody.email];
        updateReuirments.message = `${responseMessage.USER_UPDATED}, ${responseMessage.EMAIL_VERIFICATION_REQUIRED}`;
    }
    else {
        updateReuirments.message = responseMessage.USER_UPDATED;
        updateReuirments.arguments = { ...updateBody };
    }

    return updateReuirments;
}


/**
 * To get filter arguments for user
 */
export const getUserFilterArguments = (filterFeilds: UserFilters): Record<string, any> => {

    const { role, username } = filterFeilds;
    const filter: Record<string, any> = {};

    if (role) filter.role = role;
    if (username) filter.username = { [Op.like]: `%${username}%` }; // Case-insensitive search

    return filter;
}