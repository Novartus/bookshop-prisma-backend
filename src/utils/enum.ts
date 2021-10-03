export enum FILE_SIZE {
  totalBookMedia = 10, // Number of total media files that can be uploaded
  bookImage = 3 * 1024 * 1024, // 3 MB
}

export enum FILE_TYPE {
  image = 'image',
}

export enum FILE_PATH {
  newBook = 'upload/book',
}

export enum BOOK_BUY_STATUS {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
}

export enum STRIPE_CURRENCY {
  USD = 'usd',
}

export enum TRANSACTION_STATUS {
  SUCCEEDED = 'SUCCEEDED',
  FAILURE = 'FAILURE',
}
