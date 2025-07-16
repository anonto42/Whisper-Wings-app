import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilsService } from './common/utils/utils.service';
import { TemplatesService } from './common/templates/templates.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DatabaseService } from './database/database.service';
import { IpThrottlerGuard } from './common/guards/ip.throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    DatabaseModule,
    UserModule,
    AuthModule,
    DatabaseModule
  ],
  providers: [
    UtilsService,
    TemplatesService,
    JwtAuthGuard,
    RolesGuard,
    IpThrottlerGuard
  ],
})

export class AppModule implements OnModuleInit {

  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  async onModuleInit() {
    await this.databaseService.createSuperAdmin();
  }
}