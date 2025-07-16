import { IsEmail, IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";


export class CreateUserDto 
{
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({},{ message: 'Email must be a valid email' })
    email: string;

    @IsNotEmpty({ message: 'Phone is required' })
    phone: string;

    @IsNotEmpty({ message: 'Location is required' })
    location: string;

    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsNotEmpty({ message: 'Confirm Password is required' })
    confirm_password: string;

    // @IsString({ message: 'Avatar must be a string' })
    // @IsOptional()
    // avatar?: string;
}

export class LoginUserDto 
{
    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}


export class ChangePasswordDto 
{
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsString({ message: 'old password must be a string' })
    @IsNotEmpty({ message: 'old password is required' })
    old_password: string;

    @IsString({ message: 'Confirm password must be a string' })
    @IsNotEmpty({ message: 'Confirm password is required' })
    confirm_password: string;
}

export class RefreshUserDto 
{
    @IsString({ message: 'Refresh token must be a string' })
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}

export class OtpUserDto 
{
    @IsEmail({},{ message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

export class VerifyOtpDto 
{
    @IsNumber({},{ message: 'Otp must be a number' })
    @IsNotEmpty({ message: 'Otp is required' })
    otp: number;

    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}

export class ForgotPasswordDto 
{
    @IsString({ message: 'Email must be a string' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsString({ message: 'Confirm password must be a string' })
    @IsNotEmpty({ message: 'Confirm password is required' })
    confirm_password: string;

    @IsString({ message: 'Token must be a string' })
    @IsNotEmpty({ message: 'Token is required' })
    token: string
}
