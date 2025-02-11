import { Optional } from "sequelize";



export interface ITodo {
    id: string;
    title: string;
    description: string;
    userId: string;
    dueAt: Date;
    completed?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | null;
}

export interface ITodoCreation extends Optional<ITodo, 'id'> { };