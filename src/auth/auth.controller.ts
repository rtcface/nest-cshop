import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser,RawHeaders } from './decorators'


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
    @RawHeaders() rawHeaders: string[]
    ): { ok: boolean; message: string; user: User; FullName: string; rawHeaders: any; } {   
    return { 
      ok:true,
      message:'all ok',
      user,
      FullName,
      rawHeaders
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
