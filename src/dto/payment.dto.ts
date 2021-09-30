import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsNumberString,
  Length,
} from 'class-validator';

export class CardDto {
  @IsNotEmpty()
  @IsString()
  cardName: string;

  @IsNotEmpty()
  @IsString()
  cardNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  cardExpiryMonth: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(new Date().getFullYear())
  cardExpiryYear: number;
}

export class CardIdDto {
  @IsNotEmpty()
  @IsString()
  cardId: string;
}

export class AddCardDto extends CardDto {
  @IsNotEmpty()
  @IsNumberString()
  @Length(3, 4)
  cardCvc: string;
}

export class UpdateCardDto extends CardDto {
  @IsNotEmpty()
  @IsString()
  cardId: string;
}

export class DeleteCardDto extends CardIdDto {}

export class MakeDefaultCardDto extends CardIdDto {}
