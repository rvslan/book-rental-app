import { Controller, Get, Post, Param, Delete, Query } from "@nestjs/common";
import { BooksService } from "./books.service";
import { GetCurrentUser, GetCurrentUserId } from "../../src/common/decorators";
import { SearchBooksDto } from "./dto";
import { User as UserModel, Book } from "@prisma/client";
import { ApiTags, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { BookEntity } from "./entities/book.entity";

@ApiTags("Books")
@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOkResponse({ type: BookEntity, isArray: true })
  @ApiOperation({ summary: "Get all books", description: "Retrieve all books" })
  findAll(@GetCurrentUser() user: UserModel): Promise<Book[]> {
    return this.booksService.findAll(user);
  }

  @Get("search")
  @ApiOkResponse({ type: BookEntity, isArray: true })
  @ApiOperation({
    summary: "Search books",
    description: "Search books by title or author",
  })
  searchBooks(
    @Query() searchBooksDto: SearchBooksDto,
    @GetCurrentUser() user: UserModel
  ): Promise<Book[]> {
    return this.booksService.searchBooks(searchBooksDto.query, user);
  }

  @Post(":id/rent")
  @ApiOkResponse({ type: BookEntity })
  @ApiOperation({ summary: "Rent a book", description: "Rent a book by ID" })
  async rentBook(
    @Param("id") bookId: number,
    @GetCurrentUser() user: UserModel
  ) {
    return this.booksService.rentBook(bookId, user);
  }

  @Delete(":id/return")
  @ApiOkResponse({ type: BookEntity })
  @ApiOperation({
    summary: "Return a book",
    description: "Return a rented book by ID",
  })
  async returnBook(
    @Param("id") bookId: number,
    @GetCurrentUser() user: UserModel
  ) {
    return this.booksService.returnBook(bookId, user);
  }
}
