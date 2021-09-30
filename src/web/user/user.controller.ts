import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User as UserEntity } from '.prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { UpdateProfileDto } from 'src/dto/user.dto';
import {
  AddCardDto,
  DeleteCardDto,
  MakeDefaultCardDto,
  UpdateCardDto,
} from 'src/dto/payment.dto';
import { GlobalResponseType } from 'src/utils/type';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('view/profile/me')
  @UseGuards(JwtAuthGuard)
  async viewMyProfile(@User() user: UserEntity): GlobalResponseType {
    return await this.userService.viewMyProfile(user);
  }

  @Patch('update/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @User() user: UserEntity,
    @Body() updateProfileDto: UpdateProfileDto,
  ): GlobalResponseType {
    return await this.userService.updateProfile(user, updateProfileDto);
  }

  @Post('add/card')
  @UseGuards(JwtAuthGuard)
  async addCard(
    @User() user: UserEntity,
    @Body() addCardDto: AddCardDto,
  ): GlobalResponseType {
    return await this.userService.addCard(user, addCardDto);
  }

  @Get('view/card')
  @UseGuards(JwtAuthGuard)
  async viewCard(@User() user: UserEntity): GlobalResponseType {
    return await this.userService.viewCard(user);
  }

  @Patch('update/card')
  @UseGuards(JwtAuthGuard)
  async updateCard(
    @User() user: UserEntity,
    updateCardDto: UpdateCardDto,
  ): GlobalResponseType {
    return await this.userService.updateCard(user, updateCardDto);
  }

  @Delete('remove/card')
  @UseGuards(JwtAuthGuard)
  async deleteCard(
    @User() user: UserEntity,
    @Body() deleteCardDto: DeleteCardDto,
  ): GlobalResponseType {
    return await this.userService.deleteCard(user, deleteCardDto);
  }

  @Patch('default/card')
  @UseGuards(JwtAuthGuard)
  async makeDefaultCard(
    @User() user: UserEntity,
    @Body() makeDefaultCardDto: MakeDefaultCardDto,
  ): GlobalResponseType {
    return await this.userService.makeDefaultCard(user, makeDefaultCardDto);
  }
}
