export interface ResponseGlobalInterface<T> {
  data: T;
  message: string;
}

export interface JwtPayload {
  email: string;
  userId: number;
  role: string;
}

export interface StripeCardDetails {
  cardName: string;
  cardId: string;
  cardExpiryMonth: number;
  cardExpiryYear: number;
  cardLast4: string;
  cardBrand: string;
  cardDefault: boolean;
}
