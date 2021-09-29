import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  limit: number;
}
