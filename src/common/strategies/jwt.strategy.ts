// // src/auth/strategies/jwt.strategy.ts
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
// import { ConfigService } from '@nestjs/config';
// import { UserService } from 'src/modules/user/user.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private configService: ConfigService,
//     private usersService: UserService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET'),
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.usersService.findOne(payload.userId); // Fetch user from DB based on the userId
//     return user; // This user will be attached to the request object
//   }
// }
