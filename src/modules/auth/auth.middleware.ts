import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { TemplatesService } from 'src/common/templates/templates.service';
import { UtilsService } from 'src/common/utils/utils.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {

    console.log( req.headers.authorization )
    const token = req.headers.authorization
    if ( !token ) throw new HttpException('Token not found', HttpStatus.BAD_REQUEST )

    const utilsService = new UtilsService(ConfigService as any, TemplatesService as any); 

    const isVarified = utilsService.verifyJwtToken(token)
    if ( !isVarified ) throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST )

    console.log(isVarified)

    //@ts-ignore
    req.user = isVarified;

    next();
  }
}
