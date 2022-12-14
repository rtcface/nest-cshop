import { Injectable, Ip, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBExeption } from 'src/common/errorExeptions/exeptions-commons';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto, CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 5),
      });

      await this.userRepository.save(user);
      delete user.password;
      //TODO: return Json TOKEN
      return {
        ...user,
        token: this.getJwtToken({uuid: user.id})
      };  
    } catch (error) {
      handleDBExeption(error);
    }
  }
  
 async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({ 
    where:{ email },
    select: { id:true ,password:true }
     });

     if( !user )
        throw new UnauthorizedException('Credentials are not valid');

    if( bcrypt.compareSync(password, user.password) ){
      return {
        ...user,
        token: this.getJwtToken({uuid: user.id})
      };   
    }
    
    throw new UnauthorizedException('Credentials are not valid');
    
  }



  private getJwtToken ( payload:JwtPayload ){
    console.log(payload);
    const token = this.jwtService.sign(payload)

    return token;
  }







  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

}
