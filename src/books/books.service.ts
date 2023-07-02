import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Book, User as UserModel } from "@prisma/client";

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  // Fetch all books associated with a user's bookstore
  async findAll(userId: number): Promise<Book[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Return books filtered by the user's bookstoreId
    return this.prisma.book.findMany({
      where: {
        bookstoreId: user.bookstoreId,
      },
    });
  }

  // Rent a book
  async rentBook(bookId: number, userId: number): Promise<Book> {
    return this.prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new NotFoundException("Book not found");
      }

      if (book.quantity === 0) {
        throw new ForbiddenException("Book not available");
      }

      const userRentedBook = await prisma.rental.findFirst({
        where: { bookId, userId, returnedAt: null },
      });

      if (userRentedBook) {
        throw new ForbiddenException("You have already rented this book");
      }

      // Create a new rental record
      await prisma.rental.create({
        data: { bookId, userId },
      });

      // Decrease the quantity of the book by 1
      return await prisma.book.update({
        where: { id: bookId },
        data: { quantity: book.quantity - 1 },
      });
    });
  }

  // Return a book
  async returnBook(bookId: number, userId: number): Promise<Book> {
    return this.prisma.$transaction(async (prisma) => {
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new NotFoundException("Book not found");
      }

      const userRentedBook = await prisma.rental.findFirst({
        where: { bookId, userId, returnedAt: null },
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
