import { DataTypes, Model } from "sequelize";
import { ITodo, ITodoCreation } from "../interfaces";
import User from "./user.model";
import { sequelize } from "../config";


class Todo extends Model<ITodo, ITodoCreation> implements ITodo {
    public id!: string;
    public title!: string;
    public description!: string;
    public userId!: string;
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
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
        userId: {
            type: DataTypes.UUID,
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
        defaultScope: {
            attributes: {
                exclude: ["isDeleted", "deletedAt"]
            },
            where: {
                isDeleted: false
            }
        },
        scopes: {
            softDeletion: {
                attributes: { include: ["isDeleted", "deletedAt"] }
            },
            trashData: {
                attributes: { include: ["deletedAt"] }
            }
        }
    }
);

//Establish Foreign Key Relationship
Todo.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Todo, { foreignKey: "userId" });

export default Todo;