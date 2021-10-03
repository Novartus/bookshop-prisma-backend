import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class BuyBookDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bookId: number;

  @IsNotEmpty()
  @IsString()
  cardId: string;
}
