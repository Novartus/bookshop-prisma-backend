import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { User as UserEntity } from '.prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { BookAddCartDto, RemoveCartItemDto } from 'src/dto/cart.dto';
import { GlobalResponseType } from 'src/utils/type';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addBookToCart(
    @User() user: UserEntity,
    @Body() bookAddCartDto: BookAddCartDto,
  ): GlobalResponseType {
    return await this.cartService.addBookToCart(user, bookAddCartDto);
  }

  @Get('view')
  @UseGuards(JwtAuthGuard)
  async viewCartBook(@User() user: UserEntity): GlobalResponseType {
    return await this.cartService.viewCartBook(user);
  }

  @Delete('remove')
  @UseGuards(JwtAuthGuard)
  async removeCartBook(
    @User() user: UserEntity,
    @Body() removeCartItemDto: RemoveCartItemDto,
  ): GlobalResponseType {
    return await this.cartService.removeCartBook(user, removeCartItemDto);
  }
}
