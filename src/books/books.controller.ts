import { Controller, Get, Post, Param, Delete, Query } from "@nestjs/common";
import { BooksService } from "./books.service";
import { GetCurrentUser, GetCurrentUserId } from "../../src/common/decorators";
import { Book } from "@prisma/client";
import { SearchBooksDto } from "./dto";
import { User as UserModel } from "@prisma/client";

@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(@GetCurrentUser() user: UserModel) {
    return this.booksService.findAll(user);
  }

  @Get("search")
  searchBooks(
    @Query() searchBooksDto: SearchBooksDto,
    @GetCurrentUser() user: UserModel
  ): Promise<Book[]> {
    return this.booksService.searchBooks(searchBooksDto.query, user);
  }

  @Post(":id/rent")
  async rentBook(
    @Param("id") bookId: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.booksService.rentBook(bookId, userId);
  }

  @Delete(":id/return")
  async returnBook(
    @Param("id") bookId: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.booksService.returnBook(bookId, userId);
  }
}
