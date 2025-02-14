import { CompletedStatus, TodoSortKeys } from "../enums";
import { YYYYMMDD } from "./date.type";
import { PageFilter, PageInfo } from "./page.type";
import { TimeInHHMM } from "./time.type";
import { UserToShow } from "./user.type";


export type InsertTodoArgs = {
    title: string;
    description: string;
    dueDate: YYYYMMDD;
    dueTime: TimeInHHMM;
}

export type TodoFilterQuery = PageFilter & {
    title?: string;
    status?: CompletedStatus;
    userId?: string;
    dueAt?: YYYYMMDD;
    sortKey?: TodoSortKeys;
}

export type TodoToShow = {
    id: number;
    title: string;
    description: string;
    dueAt: Date;
    completed: boolean;
    user: UserToShow;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;

}

export type TodoFetchResult = PageInfo & {
    data: TodoToShow[];
}

export type UpdateTodoBody = Partial<InsertTodoArgs> & {
    completed?: boolean;
}

export type UpdateTodoArgs = Omit<UpdateTodoBody, 'dueDate' | 'dueTime'> & {
    dueAt?: Date;
}

export type TodoScope = "trashData" | null;