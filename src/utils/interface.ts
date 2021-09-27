export interface ResponseGlobalInterface<T> {
  data: T;
  message: string;
}

export interface JwtPayload {
  email: string;
  userId: number;
  role: string;
}
