import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class BookAddCartDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bookId: number;
}

export class RemoveCartItemDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  cartId: number;
}
