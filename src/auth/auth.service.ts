/* #region  Imports */
import { Injectable, Ip, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExeption } from 'src/common/errorExeptions/exeptions-commons';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CheckAuthStatusDto, CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
/* #endregion */

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /* #region  Crear usuarios */
  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: this.cryptPassword(password),
      });

      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ uuid: user.id }),
      };
    } catch (error) {
      handleDBExeption(error);
    }
  }
  /* #endregion */

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Credentials are not valid');

    if (bcrypt.compareSync(password, user.password)) {
      return {
        ...user,
        token: this.getJwtToken({ uuid: user.id }),
      };
    }

    throw new UnauthorizedException('Credentials are not valid');
  }


  async refreshToken(user: User) {

    return {
      ...user,
      token: this.getJwtToken({ uuid: user.id }),
    };

  }

  // async refreshToken(checkAuthStatus: CheckAuthStatusDto) {
  //   const { token } = checkAuthStatus;

  //   const td = this.jwtService.decode(token) as JwtPayload;

  //   if( !td ) throw new UnauthorizedException('Token are not valid')

  //   const user = await this.userRepository.findOne({
  //     where: { id:td.uuid },
  //     select: { id: true, password: true, fullName: true },
  //   });

  //   if (!user) throw new UnauthorizedException('uuid are not valid');

  //   return {
  //     ...user,
  //     token: this.getJwtToken({ uuid: user.id }),
  //   };

 
  // }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private cryptPassword(pass: string): string {
    const cryptPass = bcrypt.hashSync(pass, 5);
    return cryptPass;
  }
}
