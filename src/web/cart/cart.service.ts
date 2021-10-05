import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { User } from '.prisma/client';
import { BookAddCartDto, RemoveCartItemDto } from 'src/dto/cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BOOK_BUY_STATUS } from 'src/utils/enum';
import { GlobalResponseType, ResponseMap } from 'src/utils/type';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addBookToCart(
    user: User,
    bookAddCartDto: BookAddCartDto,
  ): GlobalResponseType {
    try {
      const book = await this.prisma.book.findFirst({
        where: {
          id: bookAddCartDto.bookId,
          status: BOOK_BUY_STATUS.AVAILABLE,
          deletedAt: null,
        },
      });

      if (!book) {
        throw new BadRequestException('Book not found to add!');
      }

      await this.prisma.cart.create({
        data: {
          userId: user.id,
          bookId: book.id,
        },
      });

      const allCartData = await this.prisma.cart.findMany({
        select: {
          book: true,
        },
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      return ResponseMap(
        {
          cartData: allCartData,
        },
        'Book added to cart successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async viewCartBook(user: User): GlobalResponseType {
    try {
      const allCartData = await this.prisma.cart.findMany({
        select: {
          book: true,
        },
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      return ResponseMap(
        {
          cartData: allCartData,
        },
        'Cart data found successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeCartBook(
    user: User,
    removeCartItemDto: RemoveCartItemDto,
  ): GlobalResponseType {
    try {
      const cartItem = await this.prisma.cart.findUnique({
        where: {
          id: removeCartItemDto.cartId,
        },
      });

      if (!cartItem) {
        throw new BadRequestException('Cart item not found to be removed!');
      }

      await this.prisma.cart.update({
        where: {
          id: removeCartItemDto.cartId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      const allCartData = await this.prisma.cart.findMany({
        select: {
          book: true,
        },
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      return ResponseMap(
        {
          cartData: allCartData,
        },
        'Cart item removed successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
