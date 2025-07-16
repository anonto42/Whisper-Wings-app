import { Body, Controller, Delete, Get, Patch, Post, Put, Req, UseGuards, Version } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enum/user.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtThrottlerGuard } from 'src/common/guards/jwt.throttler.guard';

@Controller('user')
export class UserController 
{
    constructor(
        private readonly userService: UserService,
    ){}

    @Version("1")
    @Get('/')
    @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, JwtThrottlerGuard)
    profile( @Req() req: any)
    {
        return req.user;
    }

    @Version("1")
    @Post('/')
    @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.USER)
    @UseGuards( JwtAuthGuard, RolesGuard, JwtThrottlerGuard )
    admin(@Body() body: any)
    {
        return body;
    }

    @Version("1")
    @Put('/')
    update()
    {
        return 'update';
    }

    @Version("1")
    @Patch('/')
    change()
    {
        return 'change';
    }

    @Version("1")
    @Delete('/')
    delete()
    {
        return 'delete';
    }

}
