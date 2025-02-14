import { DataTypes, Model } from "sequelize";
import { IBlackList, IBlacklistCreation } from "../interfaces";
import { sequelize } from '../config'


class Blacklist extends Model<IBlackList, IBlacklistCreation> implements IBlackList {
    public id!: string;
    public token!: string;
    public expireAt!: Date;
}

Blacklist.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expireAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "Blacklist",
        timestamps: false, // Since your Mongoose schema doesn't have timestamps
        indexes: [
            {
                fields: ["expireAt"],
                using: "BTREE"
            }
        ]
    }
);

export default Blacklist;