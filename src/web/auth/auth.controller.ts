import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, SignUpUserDto } from 'src/dto/auth.dto';
import { GlobalResponseType } from 'src/utils/type';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUpUser(@Body() signUpUserDto: SignUpUserDto): GlobalResponseType {
    return await this.authService.signUpUser(signUpUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): GlobalResponseType {
    return this.authService.login(loginDto);
  }
}
