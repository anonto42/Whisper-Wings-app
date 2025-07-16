import { Body, Controller, Post, Req, UseGuards, Version } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto, CreateUserDto, ForgotPasswordDto, LoginUserDto, OtpUserDto, RefreshUserDto, VerifyOtpDto } from './auth.dto';
import { IpThrottlerGuard } from 'src/common/guards/ip.throttler.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enum/user.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtThrottlerGuard } from 'src/common/guards/jwt.throttler.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(IpThrottlerGuard) 
@Throttle({ default: { limit: 5, ttl: 60000 } })
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Version("1")
    @Post('register')
    async register(@Body() registerDto: CreateUserDto) 
    {
        return this.authService.register(registerDto);
    }

    @Version("1")
    @Post('login')
    async login(@Body() loginDto: LoginUserDto) 
    {
        return this.authService.login(loginDto);
    }

    @Version("1")
    @Post('refresh')
    async refresh(@Body() refreshDto: RefreshUserDto) 
    {
        return this.authService.refresh(refreshDto);
    }

    @Version("1")
    @Post('otp')
    async otp(@Body() otpDto: OtpUserDto) 
    {
        return this.authService.otp(otpDto);
    }

    @Version("1")
    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) 
    {
        return this.authService.verifyOtp(verifyOtpDto);
    }

    @Version("1")
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) 
    {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Version("1")
    @Post('change-password')
    @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN, RoleEnum.USER)
    @UseGuards(JwtAuthGuard, RolesGuard, JwtThrottlerGuard)
    async changePassword( @Body() changePasswordDto: ChangePasswordDto, @Req() req: any ) 
    {
        const user = req.user;
        
        return this.authService.changePassword(user, changePasswordDto);
    }
}
