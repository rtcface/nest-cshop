import { Controller, Get, Post, Body, UseGuards, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser,RawHeaders } from './decorators'
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }


  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto); 
  }
  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute( 
    @GetUser() user:User,
    @GetUser('fullName') FullName:string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers:IncomingHttpHeaders
    ): { ok: boolean; message: string; user: User; FullName: string; rawHeaders: any; headers:any } {   
    return { 
      ok:true,
      message:'all ok',
      user,
      FullName,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  @SetMetadata('roles',['admin','super-user'])
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User,
  ){
    return {
      ok:true,
      user
    }
  }

 
}
