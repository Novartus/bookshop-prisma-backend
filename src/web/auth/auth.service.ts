import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignUpUserDto } from 'src/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtPayload } from 'src/utils/interface';
import { ResponseMap } from 'src/utils/type';
import { GlobalResponseType } from 'src/utils/type';
import { AuthHelper } from './auth.helper';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signUpUser(signUpUserDto: SignUpUserDto): GlobalResponseType {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { email: signUpUserDto.email },
      });

      if (userExists) {
        throw new ConflictException(
          `User already exists for email:${signUpUserDto.email}`,
        );
      }

      const userPassword = await AuthHelper.hash(signUpUserDto.password);
      const user = await this.prisma.user.create({
        data: {
          name: signUpUserDto.name,
          email: signUpUserDto.email,
          password: userPassword,
        },
      });

      return ResponseMap(
        {
          user: user,
        },
        'Successfully Registered',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  validatePayload(payload: JwtPayload) {
    return this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
  }

  async login(loginDto: LoginDto): GlobalResponseType {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          password: true,
        },
      });
      if (!user) {
        throw new NotFoundException(
          `No user found for email: ${loginDto.email}`,
        );
      }

      const passwordValid = await AuthHelper.validate(
        loginDto.password,
        user.password,
      );

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
      const access_token = this.jwtService.sign(payload);
      return ResponseMap(
        {
          user: user,
          access_token: access_token,
        },
        'Verified User',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
