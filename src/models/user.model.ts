import { DataTypes, Model } from "sequelize";
import { IUser, IUserCreation } from "../interfaces";
import { sequelize } from "../config";
import { Roles } from "../enums";



class User extends Model<IUser, IUserCreation> implements IUser {
    public id!: string;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: Roles;
    public verified!: boolean;
    public refreshToken!: string | null;
    public readonly createAt!: Date;
    public readonly updateAt!: Date;
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: true
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    tableName: "User",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']  // Explicitly define the unique index on 'email'
        },
    ]
}
);


export default User;