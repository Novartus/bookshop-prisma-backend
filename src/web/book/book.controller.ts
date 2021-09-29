import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { User as UserEntity } from '.prisma/client';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookService } from './book.service';
import {
  AddSellingBookDto,
  DeleteSellingBookDto,
  UpdateSellingBookDto,
} from 'src/dto/book.dto';
import { GlobalResponseType } from 'src/utils/type';
import { FILE_SIZE } from 'src/utils/enum';
import { bookFileUploadFilter } from 'src/utils/file-upload';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @UseInterceptors(
    FilesInterceptor('book_media', FILE_SIZE.totalBookMedia, {
      fileFilter: bookFileUploadFilter,
    }),
  )
  async addSellingBook(
    @User() user: UserEntity,
    @Body() addSellingBookDto: AddSellingBookDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): GlobalResponseType {
    return await this.bookService.addSellingBook(
      user,
      addSellingBookDto,
      files,
    );
  }

  @Get('view?')
  @UseGuards(JwtAuthGuard)
  async viewBookDetails(@Query('id') id: string): GlobalResponseType {
    return await this.bookService.viewBookDetails(id);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  @UseInterceptors(
    FilesInterceptor('book_media', FILE_SIZE.totalBookMedia, {
      fileFilter: bookFileUploadFilter,
    }),
  )
  async updateSellingBook(
    @User() user: UserEntity,
    @Body() updateSellingBookDto: UpdateSellingBookDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): GlobalResponseType {
    return await this.bookService.updateSellingBook(
      user,
      updateSellingBookDto,
      files,
    );
  }

  @Delete('remove')
  @UseGuards(JwtAuthGuard)
  async deleteSellingBook(
    @User() user: UserEntity,
    @Body() deleteSellingBookDto: DeleteSellingBookDto,
  ): GlobalResponseType {
    return await this.bookService.deleteSellingBook(user, deleteSellingBookDto);
  }

  @Get('view/all?')
  // @UseGuards(JwtAuthGuard)
  async viewAllBookDetails(
    @Query('page') page: string,
    @Query('size') size: string,
  ): GlobalResponseType {
    return await this.bookService.viewAllBookDetails(page, size);
  }
}
