import { DataTypes, Model } from "sequelize";
import { IUser, IUserCreation } from "../interfaces";
import { sequelize } from "../config";
import { Roles } from "../enums";



class User extends Model<IUser, IUserCreation> implements IUser {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: Roles;
    public verified!: boolean;
    public refreshToken?: string | undefined;
    public readonly createAt!: Date;
    public readonly updateAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM(Roles.ADMIN, Roles.USER),
        allowNull: false
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "User",
    timestamps: true,
    defaultScope: {
        attributes: { exclude: ['password'] }
    }

}
);


export default User;