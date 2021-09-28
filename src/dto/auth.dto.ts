import { IsNotEmpty, IsEmail, IsString, Matches } from 'class-validator';
import { Match } from 'src/shared/decorators/match.decorator';

export class SignUpUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$/)
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirm_password: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
