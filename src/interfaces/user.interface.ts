import { Optional } from 'sequelize'
import { Roles } from '../enums';


export interface IUser {
    id: string;
    username: string;
    email: string;
    password: string;
    role: Roles;
    refreshToken?: string | null;
    verified?: boolean
}

export interface IUserCreation extends Optional<IUser, "id"> { }; 