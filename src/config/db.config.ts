import { Sequelize } from "sequelize";
import { MYSQL_HOST, MYSQL_NAME, MYSQL_PASSWORD, MYSQL_USERNAME } from "./env.config";


export const sequelize = new Sequelize(MYSQL_NAME, MYSQL_USERNAME, MYSQL_PASSWORD, {
    host: MYSQL_HOST, // Replace with your server's hostname or IP
    dialect: 'mysql', // Specifies the SQL dialect
    logging: false
});

