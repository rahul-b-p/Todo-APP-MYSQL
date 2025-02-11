import { DataTypes, Model } from "sequelize";
import { IOtp, IOTPCreation } from "../interfaces";
import { sequelize } from '../config'
import User from "./user.model";

class Otp extends Model<IOtp, IOTPCreation> implements IOtp {
    public id!: string;
    public userId!: string;
    public otp!: string;
    public expiresAt!: Date;
}

Otp.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        },
        onDelete: 'CASCADE',
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(Date.now() + 5 * 60 * 1000),
        allowNull: true
    }
}, {
    sequelize,
    tableName: "Otp",
    timestamps: false, // Since your Mongoose schema doesn't have timestamps

});


//Establish Foreign Key Relationship
Otp.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Otp, { foreignKey: "userId" });


export default Otp;