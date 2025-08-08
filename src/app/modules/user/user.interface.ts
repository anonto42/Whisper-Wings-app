import { Model, Types } from 'mongoose';
import { STATUS, USER_ROLES } from '../../../enums/user';
import { TLangouage } from '../../../enums/langouage';

export type IUser = {
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  location: string;
  image?: string;
  status: STATUS;
  verified: boolean;
  language: TLangouage;
  transictionID: string;
  subscriptionDate: Date;
  favorites: Types.ObjectId[];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isValidUser(id: string):any;
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isUserExist( filter: object ): Promise<IUser>;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
