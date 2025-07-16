
import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/common/enum/user.enum';  

export const ROLES_KEY = 'role';  
export const Roles = (...role: RoleEnum[]) => SetMetadata(ROLES_KEY, role);  
