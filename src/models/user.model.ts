import { DataTypes, Model } from "sequelize";
import bcrypt from 'bcrypt';
import { IUser, IUserCreation } from "../interfaces";
import { HASH_SALT_ROUNDS, sequelize } from "../config";
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

    async checkPassword(inputPassword: string): Promise<boolean> {
        return bcrypt.compare(inputPassword, this.password);
    }
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
        allowNull: false,
        set(value: string) {
            const salt = bcrypt.genSaltSync(HASH_SALT_ROUNDS); // Generate salt
            this.setDataValue("password", bcrypt.hashSync(value, salt));
        }
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
    ],
    defaultScope: {
        attributes: { exclude: ["password","refreshToken"] }, // Automatically exclude password
    },
    scopes: {
        withPassword: { attributes: { include: ["password"] } },
        withRefreshToken: { attributes: { include: ["refreshToken"] } }
    },
}
);


export default User;