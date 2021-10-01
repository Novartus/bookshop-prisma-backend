import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { filter, includes, map, pull } from 'lodash';
import { User } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddSellingBookDto,
  DeleteSellingBookDto,
  UpdateSellingBookDto,
} from 'src/dto/book.dto';
import { GlobalResponseType, ResponseMap } from 'src/utils/type';
import { FILE_PATH, FILE_SIZE, FILE_TYPE } from 'src/utils/enum';
import { editFileName, fileUpload } from 'src/utils/file-upload';
import { FileNameDto } from 'src/dto/file.dto';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async addSellingBook(
    user: User,
    addSellingBookDto: AddSellingBookDto,
    media: Express.Multer.File[],
  ): GlobalResponseType {
    try {
      const existingBook = await this.prisma.book.findUnique({
        where: { isbn: addSellingBookDto.isbn },
      });

      if (existingBook) {
        throw new BadRequestException(
          'Book already exists. If you think this is a mistake, please report this to admin',
        );
      }

      filter(media, (data) => {
        const file_type = data.mimetype.split('/');
        if (
          file_type[0] === FILE_TYPE.image &&
          +data.size > FILE_SIZE.bookImage
        ) {
          throw new BadGatewayException(
            `${data.originalname}: Image is too large, max allowed size is 3MB`,
          );
        }
      });

      const newBook = await this.prisma.book.create({
        data: {
          title: addSellingBookDto.title,
          sellingPrice: addSellingBookDto.sellingPrice,
          originalPrice: addSellingBookDto.originalPrice,
          isbn: addSellingBookDto.isbn,
          publisher: addSellingBookDto.publisher,
          author: addSellingBookDto.author,
          language: addSellingBookDto.language,
          sellerId: user.id,
        },
      });

      const fileResponse: Array<FileNameDto> = [];
      if (newBook) {
        for (let i = 0; i < media.length; i++) {
          const newName = editFileName(media[i]);
          const mediaPath = fileUpload(newName, media[i], FILE_PATH.newBook);
          const fileType = media[i].mimetype.split('/');
          const bookMedia = await this.prisma.bookMedia.create({
            data: {
              media: mediaPath,
              bookId: newBook.id,
            },
          });
          const fileNameObj: FileNameDto = {
            originalName: media[i].originalname,
            fileURL: bookMedia.media,
            mimetype: fileType[0],
            size: media[i].size,
          };
          fileResponse.push(fileNameObj);
        }
      }

      return ResponseMap(
        {
          book: newBook,
          bookMedia: fileResponse,
        },
        'Book added successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async viewBookDetails(id: string): GlobalResponseType {
    try {
      const bookDetails = await this.prisma.book.findFirst({
        where: {
          id: parseInt(id) ? parseInt(id) : 0,
          deletedAt: null,
        },
        select: {
          bookMedia: {
            where: {
              deletedAt: null,
            },
          },
        },
      });

      if (!bookDetails) {
        throw new BadRequestException('Book not found!');
      }

      return ResponseMap(
        {
          book: bookDetails,
        },
        'Book successfully found',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateSellingBook(
    user: User,
    updateSellingBookDto: UpdateSellingBookDto,
    media: Express.Multer.File[],
  ): GlobalResponseType {
    try {
      const book = await this.prisma.book.findFirst({
        where: { id: updateSellingBookDto.bookId, sellerId: user.id },
      });

      if (!book) {
        throw new BadRequestException('No book found to update');
      }

      filter(media, (data) => {
        const file_type = data.mimetype.split('/');
        if (
          file_type[0] === FILE_TYPE.image &&
          +data.size > FILE_SIZE.bookImage
        ) {
          throw new BadGatewayException(
            `${data.originalname}: Image is too large, max allowed size is 3MB`,
          );
        }
      });

      const updateBook = await this.prisma.book.update({
        where: { id: updateSellingBookDto.bookId },
        data: {
          title: updateSellingBookDto.title,
          sellingPrice: updateSellingBookDto.sellingPrice,
          originalPrice: updateSellingBookDto.originalPrice,
          isbn: updateSellingBookDto.isbn,
          publisher: updateSellingBookDto.publisher,
          author: updateSellingBookDto.author,
          language: updateSellingBookDto.language,
        },
        select: {
          bookMedia: {
            where: {
              deletedAt: null,
            },
          },
        },
      });

      let originalTaskMedia = [];
      let deleteMedia = [];

      const fileResponse: Array<FileNameDto> = [];
      if (updateBook.bookMedia.length > 0) {
        originalTaskMedia = map(updateBook.bookMedia, (data) => {
          return data.media;
        });
        deleteMedia = originalTaskMedia;
        for (let i = 0; i < media.length; i++) {
          const mediaName = `${process.env.IMAGE_SITE_URL}${FILE_PATH.newBook}/${media[i].originalname}`;
          if (includes({ ...originalTaskMedia }, mediaName)) {
            deleteMedia = pull(originalTaskMedia, mediaName);
          } else {
            const newName = editFileName(media[i]);
            const mediaPath = fileUpload(newName, media[i], FILE_PATH.newBook);
            const fileType = media[i].mimetype.split('/');
            const bookMedia = await this.prisma.bookMedia.create({
              data: {
                media: mediaPath,
                bookId: book.id,
              },
            });
            const fileNameObj: FileNameDto = {
              originalName: media[i].originalname,
              fileURL: bookMedia.media,
              mimetype: fileType[0],
              size: media[i].size,
            };
            fileResponse.push(fileNameObj);
          }
        }

        await this.prisma.bookMedia.updateMany({
          where: {
            media: {
              in: deleteMedia,
            },
          },
          data: {
            deletedAt: new Date(),
          },
        });
      } else {
        for (let i = 0; i < media.length; i++) {
          const newName = editFileName(media[i]);
          const mediaPath = fileUpload(newName, media[i], FILE_PATH.newBook);
          const fileType = media[i].mimetype.split('/');
          const bookMedia = await this.prisma.bookMedia.create({
            data: {
              media: mediaPath,
              bookId: book.id,
            },
          });
          const fileNameObj: FileNameDto = {
            originalName: media[i].originalname,
            fileURL: bookMedia.media,
            mimetype: fileType[0],
            size: media[i].size,
          };
          fileResponse.push(fileNameObj);
        }
      }

      return ResponseMap(
        {
          book: updateBook,
          bookMedia: fileResponse,
        },
        'Book updated successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSellingBook(
    user: User,
    deleteSellingBookDto: DeleteSellingBookDto,
  ): GlobalResponseType {
    try {
      const book = await this.prisma.book.findFirst({
        where: {
          id: deleteSellingBookDto.bookId,
          sellerId: user.id,
          deletedAt: null,
        },
      });

      if (!book) {
        throw new BadRequestException('Book not found!');
      }

      const bookData = await this.prisma.book.update({
        where: {
          id: deleteSellingBookDto.bookId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await this.prisma.bookMedia.updateMany({
        where: {
          bookId: deleteSellingBookDto.bookId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return ResponseMap(
        {
          book: bookData,
        },
        'Book successfully deleted',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async viewAllBookDetails(page: string, size: string): GlobalResponseType {
    try {
      const take = parseInt(size) ? parseInt(size) : 10;
      const pageNo = parseInt(page) ? parseInt(page) : 1;
      const skip = (pageNo - 1) * take;
      const bookDetails = await this.prisma.book.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          author: true,
          title: true,
          publisher: true,
          language: true,
          originalPrice: true,
          sellingPrice: true,
          isbn: true,
          createdAt: true,
          bookMedia: {
            where: {
              deletedAt: null,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: skip,
        take: take,
      });
      const totalBooks = await this.prisma.book.count();

      return ResponseMap(
        {
          book: bookDetails,
          totalBooks: totalBooks,
        },
        'Book successfully found',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
