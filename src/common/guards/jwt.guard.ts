import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UtilsService } from 'src/common/utils/utils.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly utilsService: UtilsService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new HttpException('Authorization token missing', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = this.utilsService.verifyJwtToken(token);
      request.user = decoded;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException('Token has expired, please login again', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
