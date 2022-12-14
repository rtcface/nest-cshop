/* #region  Imports */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, CheckAuthStatusDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
/* #endregion */

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('refresh-token')
  @Auth()
  checkAuthStatus(@GetUser() user: User){
    return this.authService.refreshToken(user);
  }

  // checkAuthStatus(@Body() checkAuthStatusDto: CheckAuthStatusDto){
  //   return this.authService.refreshToken(checkAuthStatusDto);
  // }



  /* #region  Controller Test Demo */
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('fullName') FullName: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ): {
    ok: boolean;
    message: string;
    user: User;
    FullName: string;
    rawHeaders: any;
    headers: any;
  } {
    return {
      ok: true,
      message: 'all ok',
      user,
      FullName,
      rawHeaders,
      headers,
    };
  }

  // @SetMetadata('roles',['admin','super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.superuser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superuser)
  private3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
  /* #endregion */
}
