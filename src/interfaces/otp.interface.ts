import { Optional } from "sequelize";


export interface IOtp {
    id: string;
    userId: string;
    otp: string;
    expiresAt?: Date;
}

export interface IOTPCreation extends Optional<IOtp, 'id'> { };