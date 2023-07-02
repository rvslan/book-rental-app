import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { GetCurrentUserId } from "src/common/decorators";


@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@GetCurrentUserId() userId: number) {
    return this.booksService.findAll(userId);
  }

  @Post(':id/rent')
  async rentBook(@Param('id') bookId: number, @GetCurrentUserId() userId: number) {
    return this.booksService.rentBook(bookId, userId);
  }

  @Delete(':id/return')
  async returnBook(@Param('id') bookId: number, @GetCurrentUserId() userId: number) {
    return this.booksService.returnBook(bookId, userId);
  }
}
