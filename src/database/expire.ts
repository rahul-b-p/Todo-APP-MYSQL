import { Op } from "sequelize";
import { Blacklist, Otp } from "../models";
import { logger } from "../utils";



export const deleteExpiredTokens = async () => {
    try {
        await Blacklist.destroy({
            where: {
                expireAt: { [Op.lt]: new Date() }
            }
        });
        logger.info("Expired Tokens Cleared");
    } catch (error) {
        logger.error("Error deleting expired tokens:", error);
    }
};

export const deleteExpiredOtps = async () => {
    try {
        await Otp.destroy({
            where: {
                expiresAt: { [Op.lt]: new Date() } // Delete if expired
            }
        });
        logger.info("Expired OTPs Cleared");
    } catch (error) {
        logger.error("Error deleting expired OTPs:", error);
    }
};
