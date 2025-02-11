import { DataTypes, Model } from "sequelize";
import { ITodo, ITodoCreation } from "../interfaces";
import User from "./user.model";
import { sequelize } from "../config";


class Todo extends Model<ITodo, ITodoCreation> implements ITodo {
    public id!: number;
    public title!: string;
    public description!: string;
    public createdBy!: number;
    public dueAt!: Date;
    public completed!: boolean;
    public isDeleted!: boolean;
    public deletedAt?: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Todo.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        dueAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        deletedAt: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
    },
    {
        sequelize,
        tableName: 'Todo',
        timestamps: true,
    }
);

//Establish Foreign Key Relationship
Todo.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Todo, { foreignKey: "createdBy" });

export default Todo;