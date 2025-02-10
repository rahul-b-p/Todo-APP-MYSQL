import { Op } from "sequelize";
import { Blacklist } from "../models";
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
        logger.error(" Error deleting expired tokens:", error);
    }
};


