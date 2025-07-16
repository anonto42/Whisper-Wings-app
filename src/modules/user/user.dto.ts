import { RoleEnum } from "../../common/enum/user.enum";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto 
{
    name?: string;
    email?: string;
    age?: number;
    password?: string;
    role?: RoleEnum;
    avatar?: string;
}
  
