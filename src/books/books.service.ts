import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User as UserModel, Book } from "@prisma/client";

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  // Search all books associated with a user's bookstore
  async searchBooks(query: string, user: UserModel): Promise<Book[]> {
    return this.prisma.book.findMany({
      where: {
        bookstoreId: user.bookstoreId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { author: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  }

  // Fetch all books associated with a user's bookstore
  async findAll(user: UserModel): Promise<Book[]> {
    // Return books filtered by the user's bookstoreId
    return this.prisma.book.findMany({
      where: {
        bookstoreId: user.bookstoreId,
      },
    });
  }

  // Rent a book
  async rentBook(bookId: number, user: UserModel): Promise<Book> {
    return this.prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findFirst({
        where: {
          id: bookId,
          bookstoreId: user.bookstoreId,
        },
      });

      if (!book) {
        throw new NotFoundException("Book not found");
      }

      if (book.quantity === 0) {
        throw new ForbiddenException("Book not available");
      }

      const userRentedBook = await prisma.rental.findFirst({
        where: { bookId, userId: user.id, returnedAt: null },
      });

      if (userRentedBook) {
        throw new ForbiddenException("You have already rented this book");
      }

      // Create a new rental record
      await prisma.rental.create({
        data: { bookId, userId: user.id },
      });

      // Decrease the quantity of the book by 1
      return await prisma.book.update({
        where: { id: bookId },
        data: { quantity: book.quantity - 1 },
      });
    });
  }

  // Return a book
  async returnBook(bookId: number, user: UserModel): Promise<Book> {
    return this.prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findFirst({
        where: { id: bookId, bookstoreId: user.bookstoreId },
      });

      if (!book) {
        throw new NotFoundException("Book not found");
      }

      const userRentedBook = await prisma.rental.findFirst({
        where: { bookId, userId: user.id, returnedAt: null },
      });

      if (!userRentedBook) {
        throw new Error("You have not rented this book");
      }

      // Update the rental record with returnedAt date
      await prisma.rental.update({
        where: { id: userRentedBook.id },
        data: { returnedAt: new Date() },
      });

      // Increase the quantity of the book by 1
      return prisma.book.update({
        where: { id: bookId },
        data: { quantity: book.quantity + 1 },
      });
    });
  }
}
