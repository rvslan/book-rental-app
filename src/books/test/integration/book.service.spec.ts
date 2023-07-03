import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { BooksService } from "../../books.service";
import { PrismaService } from "../../../prisma/prisma.service";
import { AppModule } from "../../../app.module";
import { Book, User, Rental, Bookstore } from "@prisma/client";

// Test data
const testUser = {
  email: "test1@gmail.com",
  password: "super-secret-password",
};

describe("bookService", () => {
  let prisma: PrismaService;
  let bookService: BooksService;
  let moduleRef: TestingModule;
  let bookstore: Bookstore;
  let user: User;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    bookService = moduleRef.get(BooksService);

    // Create a test bookstore
    bookstore = await prisma.bookstore.create({
      data: {
        name: "Test Bookstore",
        location: "Test Location",
      },
    });

    // Create a test user
    user = await prisma.user.create({
      data: {
        email: testUser.email,
        hash: testUser.password,
        bookstoreId: bookstore.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up any created data after each test
    await prisma.rental.deleteMany({});
    await prisma.book.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    await prisma.bookstore.delete({
      where: {
        id: bookstore.id,
      },
    });
    await prisma.rental.deleteMany({});
    await prisma.book.deleteMany({});
    // Close module
    await moduleRef.close();
  });

  describe("findAll", () => {
    it("should return all books associated with a user's bookstore", async () => {
      // Create test books associated with the user's bookstore
      const book1: Book = await prisma.book.create({
        data: {
          title: "Book 1",
          author: "Author 1",
          quantity: 5,
          bookstoreId: user.bookstoreId,
        },
      });
      const book2: Book = await prisma.book.create({
        data: {
          title: "Book 2",
          author: "Author 2",
          quantity: 3,
          bookstoreId: user.bookstoreId,
        },
      });

      // Call the findAll method
      const result: Book[] = await bookService.findAll(user);

      // Expect the result to contain the created books
      expect(result).toEqual([book1, book2]);
    });
  });

  describe("rentBook", () => {
    it("should rent a book and decrease its quantity by 1", async () => {
      // Create a test book
      const book: Book = await prisma.book.create({
        data: {
          title: "Book",
          author: "Author",
          quantity: 5,
          bookstoreId: bookstore.id,
        },
      });

      // Call the rentBook method
      const result: Book = await bookService.rentBook(book.id, user.id);

      // Expect the quantity of the book to decrease by 1
      expect(result.quantity).toBe(book.quantity - 1);
    });

    it("should throw NotFoundException when the book is not found", async () => {
      // Call the rentBook method with a non-existent book id
      await expect(bookService.rentBook(999, user.id)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw ForbiddenException when the book quantity is 0", async () => {
      // Create a test book with quantity 0
      const book: Book = await prisma.book.create({
        data: {
          title: "Book",
          author: "Author",
          quantity: 0,
          bookstoreId: bookstore.id,
        },
      });

      // Call the rentBook method
      await expect(bookService.rentBook(book.id, user.id)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw ForbiddenException when the user has already rented the book", async () => {
      // Create a test book
      const book: Book = await prisma.book.create({
        data: {
          title: "Book",
          author: "Author",
          quantity: 5,
          bookstoreId: bookstore.id,
        },
      });

      // Create a rental record for the user and book
      const rental: Rental = await prisma.rental.create({
        data: {
          bookId: book.id,
          userId: user.id,
        },
      });

      // Call the rentBook method
      await expect(bookService.rentBook(book.id, user.id)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("returnBook", () => {
    it("should return a book and increase its quantity by 1", async () => {
      // Create a test book
      const book: Book = await prisma.book.create({
        data: {
          title: "Book",
          author: "Author",
          quantity: 5,
          bookstoreId: bookstore.id,
        },
      });

      // Create a rental record for the user and book
      const rental: Rental = await prisma.rental.create({
        data: {
          bookId: book.id,
          userId: user.id,
        },
      });

      // Call the returnBook method
      const result: Book = await bookService.returnBook(book.id, user.id);

      // Expect the quantity of the book to increase by 1
      expect(result.quantity).toBe(book.quantity + 1);
    });

    it("should throw NotFoundException when the book is not found", async () => {
      // Call the returnBook method with a non-existent book id
      await expect(bookService.returnBook(999, user.id)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw Error when the user has not rented the book", async () => {
      // Create a test book
      const book: Book = await prisma.book.create({
        data: {
          title: "Book",
          author: "Author",
          quantity: 5,
          bookstoreId: bookstore.id,
        },
      });

      // Call the returnBook method
      await expect(bookService.returnBook(book.id, user.id)).rejects.toThrow(
        Error
      );
    });
  });
});
