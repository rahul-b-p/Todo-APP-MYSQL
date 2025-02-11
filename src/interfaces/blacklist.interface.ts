import { Optional } from 'sequelize'

export interface IBlackList {
    id: number;
    token: string;
    expireAt: Date;
};


export interface IBlacklistCreation extends Optional<IBlackList, 'id'> {

}