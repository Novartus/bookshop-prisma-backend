import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { TRANSACTION_STATUS } from 'src/utils/enum';

export class BuyBookDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bookId: number;

  @IsNotEmpty()
  @IsString()
  cardId: string;
}

export class ViewTransactionDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @IsEnum(TRANSACTION_STATUS)
  transactionStatus: string;

  @IsOptional()
  @IsString()
  bookTitle: string;

  @IsOptional()
  @IsString()
  sellerName: string;
}
