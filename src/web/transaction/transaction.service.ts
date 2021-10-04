import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import Stripe from 'src/utils/Stripe';
import { User } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BuyBookDto, ViewTransactionDto } from 'src/dto/transaction.dto';
import { GlobalResponseType, ResponseMap } from 'src/utils/type';
import {
  BOOK_BUY_STATUS,
  STRIPE_CURRENCY,
  TRANSACTION_STATUS,
} from 'src/utils/enum';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async buyBook(user: User, buyBookDto: BuyBookDto): GlobalResponseType {
    try {
      const book = await this.prisma.book.findFirst({
        where: {
          id: buyBookDto.bookId,
          status: BOOK_BUY_STATUS.AVAILABLE,
          deletedAt: null,
        },
      });

      if (!book) {
        throw new BadRequestException('Book not found!');
      }

      const stripeCharge = await Stripe.charges.create({
        amount: +book.sellingPrice * 100,
        currency: STRIPE_CURRENCY.USD,
        description: `${book.title} - ${book.author}, By User ID: ${user.id}`,
        source: buyBookDto.cardId,
        customer: user.stripeCustomerId,
        receipt_email: user.email,
      });

      const transaction = await this.prisma.transaction.create({
        data: {
          bookId: book.id,
          buyerId: user.id,
          transactionID: stripeCharge.id,
          transactionStatus:
            TRANSACTION_STATUS[`${stripeCharge.status.toUpperCase()}`],
        },
      });

      if (transaction.transactionStatus === TRANSACTION_STATUS.SUCCEEDED) {
        await this.prisma.book.update({
          where: { id: book.id },
          data: {
            status: BOOK_BUY_STATUS.SOLD,
          },
        });
      }

      return ResponseMap(
        {
          transaction: transaction,
        },
        'Transaction Successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async viewTransactions(
    user: User,
    viewTransactionDto: ViewTransactionDto,
  ): GlobalResponseType {
    try {
      const take = viewTransactionDto.limit;
      const pageNo = viewTransactionDto.page;
      const skip = (pageNo - 1) * take;
      const queryFilter: any = {
        select: {
          // book: true,
          book: {
            include: {
              bookMedia: true,
              user: true,
            },
          },
          deletedAt: true,
          buyerId: true,
        },
        where: {
          buyerId: user.id,
          deletedAt: null,
          book: {
            deletedAt: null,
            user: {
              deletedAt: null,
            },
          },
        },
        skip: skip,
        take: take,
      };

      if (viewTransactionDto.transactionStatus) {
        queryFilter.where.transactionStatus =
          viewTransactionDto.transactionStatus;
      }
      if (viewTransactionDto.bookTitle) {
        queryFilter.where.book.title.contains = viewTransactionDto.bookTitle;
      }
      if (viewTransactionDto.sellerName) {
        queryFilter.where.book.user.name.contains =
          viewTransactionDto.sellerName;
      }

      const transactions = await this.prisma.transaction.findMany(queryFilter);

      return ResponseMap(
        {
          transaction: transactions,
        },
        'Transaction List Success',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
