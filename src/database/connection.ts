import { sequelize } from "../config";
import { logger } from "../utils";


/**
 * Function to connect with mysql databse
 */
export const connectMySql = async () => {
    try {
        await sequelize.authenticate();
        logger.info('MySQL Connected Successfully');
    } catch (error: any) {
        logger.error(`connection failed due to ${error.message}`)
    }
}


/**
 * Function to synchronize with mysql databse
 */
export const synchronizeDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        logger.info("Database synchronized.");
    } catch (error) {
        logger.error("Database synchronization failed:", error);
    }
}