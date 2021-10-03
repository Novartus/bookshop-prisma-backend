import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User as UserEntity } from '.prisma/client';
import { BuyBookDto } from 'src/dto/transaction.dto';
import { User } from 'src/shared/decorators/user.decorator';
import { GlobalResponseType } from 'src/utils/type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('buy/book')
  @UseGuards(JwtAuthGuard)
  async buyBook(
    @User() user: UserEntity,
    @Body() buyBookDto: BuyBookDto,
  ): GlobalResponseType {
    return await this.transactionService.buyBook(user, buyBookDto);
  }
}
