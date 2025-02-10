import { Optional } from "sequelize";


export interface IOtp {
    id: number
    userId: number;
    otp: string;
    expiresAt?: Date;
}

export interface IOTPCreation extends Optional<IOtp, 'id'> { };