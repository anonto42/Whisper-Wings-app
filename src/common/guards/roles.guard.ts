import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enum/user.enum'; 
import { ROLES_KEY } from '../decorators/roles.decorator'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<RoleEnum[]>(ROLES_KEY, context.getHandler()); 

    if (!requiredRoles) {
      return true; 
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user || !user.role) {
      throw new HttpException('User roles are missing', HttpStatus.FORBIDDEN); 
    }
    
    return requiredRoles.some(role => user.role.includes(role));
  }
}
