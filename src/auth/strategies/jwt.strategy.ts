import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt'
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-strategy';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ){

    constructor(
        @InjectRepository( User )
        private readonly userRepository:Repository<User>,
        configService:ConfigService
    ) {
        super({
            secretOrkey: configService.get<string>('jwt_secret'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }
     

    async validate( payload: JwtPayload ): Promise<User>{

        const { email } = payload;

        const  user = await this.userRepository.findOneBy({ email});

        if( !user )
            throw new UnauthorizedException('Token not valid');

        if( !user.isActive )
            throw new UnauthorizedException('User is inactive talk with an admin');

        return user;

    }

}