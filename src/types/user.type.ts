
import { Roles, UserSortKeys } from "../enums";
import { PageFilter, PageInfo } from "./page.type";


export type UserAuthBody = {
    email: string;
    password: string;
}



export type UserInsertArgs = UserAuthBody & {
    username: string;
    role?: Roles;
}

export type UserSignUpBody = Omit<UserInsertArgs, 'role'>;

export type UserUpdateArgs = {
    username?: string;
    email?: string;
    password?: string;
    role?: Roles;
    refreshToken?: string | null;
    verified?: boolean
};

export type VerifyUserBody = {
    email: string;
    otp: string;
}

export type UserPasswordResetBody = VerifyUserBody & {
    password: string;
    confirmPassword: string;
}

export type UserUpdateBody = Omit<UserUpdateArgs, 'password' | 'refreshToken'>;

export type UserToShow = UserAuthBody & {
    id: number;
    role: Roles;
    verified: boolean
    createdAt: Date;
    updatedAt: Date;

}

export type UserUpdateRequirments = {
    message: string;
    arguments: UserUpdateArgs;
    mailTo?: string[];
}

export type UserFilterQuery = PageFilter & {
    role?: Roles;
    sortKey?: UserSortKeys;
    username?: string;
}

export type UserFilters = {
    role?: Roles;
    username?: string;
}

export type UserFetchResult = PageInfo & {
    data: UserToShow[];
}