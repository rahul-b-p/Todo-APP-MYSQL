import { Sequelize } from "sequelize";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME } from "./env.config";


export const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST, // Replace with your server's hostname or IP
    dialect: 'mysql', // Specifies the SQL dialect
    logging: false
});

