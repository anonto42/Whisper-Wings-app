import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleEnum } from 'src/common/enum/user.enum';
import { User } from 'src/modules/user/user.schema';

@Injectable()
export class DatabaseService 
{
  constructor(
    @InjectModel( User.name )
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService
  ) {}

  async createSuperAdmin() 
  {
    try {
      const existingSuperAdmin = await this.userModel.findOne({
        role: RoleEnum.SUPER_ADMIN,
      });

      if (existingSuperAdmin) {
        console.log('Super admin already exists.');
        return;
      }

      const superAdminName = this.configService.get<string>('SUPER_ADMIN_NAME');
      const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
      const superAdminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD');

      await this.userModel.create({
        name: superAdminName,
        email: superAdminEmail,
        password: superAdminPassword,
        role: RoleEnum.SUPER_ADMIN,
      });

      console.log('Super user created successfully!');
    } catch (error) {
      console.log('Error creating super user', error);
    }
  }
}
