import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { TemplatesService } from 'src/common/templates/templates.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UtilsService 
{
  private readonly transporter: nodemailer.Transporter;
  
  constructor(
      private readonly configService: ConfigService,
      private readonly templatesService: TemplatesService
  ) {
    try {
      this.transporter = nodemailer.createTransport({
          host: this.configService.get('EMAIL_HOST'),
          port: this.configService.get('EMAIL_PORT'),
          secure: false, 
          auth: {
            user: this.configService.get('EMAIL_USER'),
            pass: this.configService.get('EMAIL_PASS'),
          },
      })
    } catch (error) {
      throw new HttpException('Failed to create transporter', HttpStatus.BAD_REQUEST);
    }
  }

  async sendMail(to: string, otp: number, subject: string = 'Your One-Time Password (OTP)', message: string = 'Here is your OTP for verification:'): Promise<void> 
  {
    const htmlTemplate = this.templatesService.generateOtpTemplate(otp, subject, message);

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'), 
      to, 
      subject, 
      html: htmlTemplate,
    };
  
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException('Failed to send email', HttpStatus.BAD_REQUEST);
    }
  }

  ganarateHash(value: string): string
  {
    return bcrypt.hashSync(value, 10);
  }

  compareHash(value: string, hash: string): boolean
  {
    return bcrypt.compareSync(value, hash);
  }

  generateOtp(length: number): number 
  {
    if (length < 1) {
      throw new HttpException('Length must be a positive integer', HttpStatus.BAD_REQUEST);
    }
  
    const min = Math.pow(10, length - 1); 
    const max = Math.pow(10, length) - 1; 
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createAccessToken(payload: {id: string, role: string}): string
  {
    const secretKey = this.configService.get('JWT_SECRET');
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');

    if ( !secretKey || !expiresIn ) throw new HttpException('JWT_SECRET or JWT_EXPIRES_IN is not defined', HttpStatus.BAD_REQUEST);

    return jwt.sign(payload, secretKey, { expiresIn: expiresIn });
  }

  createRefreshToken(payload: {id: string, role: string}): string
  {
    const secretKey = this.configService.get('JWT_SECRET');
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');

    if ( !secretKey || !expiresIn ) throw new HttpException('JWT_REFRESH_SECRET or JWT_REFRESH_EXPIRES_IN is not defined', HttpStatus.BAD_REQUEST);

    return jwt.sign(payload, secretKey, { expiresIn: expiresIn });
  }

  verifyJwtToken(token: string): any
  {
    const secretKey = this.configService.get('JWT_SECRET');
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');

    if ( !secretKey || !expiresIn ) throw new HttpException('JWT_SECRET or JWT_EXPIRES_IN is not defined', HttpStatus.BAD_REQUEST);

    return jwt.verify(token, secretKey);
  }

}
