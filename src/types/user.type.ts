
import { Roles } from "../enums";
import { IUser } from "../interfaces";


export type UserAuthBody = {
    email: string;
    password: string;
}



export type UserInsertArgs = UserAuthBody & {
    username: string;
    role?: Roles;
}


