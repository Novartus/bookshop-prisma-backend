import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class AddSellingBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @Transform(({ value }) => +value)
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(40)
  sellingPrice: number;

  @Transform(({ value }) => +value)
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  originalPrice: number;

  @IsNotEmpty()
  @IsString()
  isbn: string;

  @IsNotEmpty()
  @IsString()
  publisher: string;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  language: string;
}

export class UpdateSellingBookDto extends AddSellingBookDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bookId: number;
}

export class DeleteSellingBookDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  bookId: number;
}
