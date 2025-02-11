
import { Roles } from "../enums";


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
