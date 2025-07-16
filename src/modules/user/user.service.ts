import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UserService 
{
    constructor(
        @InjectModel( User.name )
        private readonly userModel: Model<User>
    ){}

    async profile( id: string ): Promise<User>
    {
        const user = await this.userModel.findById( id )

        if( !user )throw new HttpException('User not found', HttpStatus.NOT_FOUND )

        return user
    }
    
}
