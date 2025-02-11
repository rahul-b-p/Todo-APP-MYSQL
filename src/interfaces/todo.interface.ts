import { Optional } from "sequelize";



export interface ITodo {
    id: number;
    title: string;
    description: string;
    userId: number;
    dueAt: Date;
    completed?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | null;
}

export interface ITodoCreation extends Optional<ITodo, 'id'> { };