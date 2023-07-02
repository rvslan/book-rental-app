import { Test, TestingModule } from "@nestjs/testing";
import { decode } from "jsonwebtoken";
import { AppModule } from "../../../app.module";
import { PrismaService } from "../../../prisma/prisma.service";
import { AuthService } from "../../auth.service";
import { Tokens } from "../../types";
import { User, Bookstore } from "@prisma/client";

// Test data
const user = {
  email: "test@gmail.com",
  password: "super-secret-password",
};

describe("Auth Flow", () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let moduleRef: TestingModule;
  let bookstore: Bookstore;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);

    // Create a test bookstore
    bookstore = await prisma.bookstore.create({
      data: {
        name: "Test Bookstore",
        location: "Test Location",
      },
    });
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe("signup", () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it("should signup", async () => {
      // Create a test bookstore
      const bookstore: Bookstore = await prisma.bookstore.create({
        data: {
          name: "Test Bookstore",
          location: "Test Location",
        },
      });

      // Call the signupLocal method and get the tokens
      const tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
        bookstoreId: bookstore.id,
      });

      // Assertions
      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it("should throw on duplicate user signup", async () => {
      let tokens: Tokens | undefined;

      try {
        // Attempt to signup with the same user details again
        tokens = await authService.signupLocal({
          email: user.email,
          password: user.password,
          bookstoreId: bookstore.id,
        });
      } catch (error) {
        // Expecting a 403 Forbidden error
        expect(error.status).toBe(403);
      }

      // The tokens should be undefined
      expect(tokens).toBeUndefined();
    });
  });

  describe("signin", () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it("should throw if no existing user", async () => {
      let tokens: Tokens | undefined;
      try {
        // Attempt to sign in with non-existent user
        tokens = await authService.signinLocal({
          email: user.email,
          password: user.password,
        });
      } catch (error) {
        // Expecting a 403 Forbidden error
        expect(error.status).toBe(403);
      }

      // The tokens should be undefined
      expect(tokens).toBeUndefined();
    });

    it("should login", async () => {
      // Create a user by signing up
      await authService.signupLocal({
        email: user.email,
        password: user.password,
        bookstoreId: bookstore.id,
      });

      // Call the signinLocal method and get the tokens
      const tokens = await authService.signinLocal({
        email: user.email,
        password: user.password,
      });

      // Assertions
      expect(tokens.access_token).toBeTruthy();
      expect(tokens.refresh_token).toBeTruthy();
    });

    it("should throw if password incorrect", async () => {
      let tokens: Tokens | undefined;
      try {
        // Attempt to sign in with incorrect password
        tokens = await authService.signinLocal({
          email: user.email,
          password: user.password + "a",
        });
      } catch (error) {
        // Expecting a 403 Forbidden error
        expect(error.status).toBe(403);
      }

      // The tokens should be undefined
      expect(tokens).toBeUndefined();
    });
  });

  describe("logout", () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it("should pass if call to non-existent user", async () => {
      // Call the logout method with a non-existent user ID
      const result = await authService.logout(4);

      // Expecting the result to be defined
      expect(result).toBeDefined();
    });

    it("should logout", async () => {
      // Create a user by signing up
      await authService.signupLocal({
        email: user.email,
        password: user.password,
        bookstoreId: bookstore.id,
      });

      let userFromDb: User | null;

      // Find the user in the database
      userFromDb = await prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });
      expect(userFromDb?.hashedRt).toBeTruthy();

      // Call the logout method
      await authService.logout(userFromDb!.id);

      // Find the user in the database again
      userFromDb = await prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });

      // Expecting the hashedRt to be falsy (null or undefined)
      expect(userFromDb?.hashedRt).toBeFalsy();
    });
  });

  describe("refresh", () => {
    beforeAll(async () => {
      await prisma.cleanDatabase();
    });

    it("should throw if no existing user", async () => {
      let tokens: Tokens | undefined;
      try {
        // Attempt to refresh tokens for a non-existent user
        tokens = await authService.refreshTokens(1, "");
      } catch (error) {
        // Expecting a 403 Forbidden error
        expect(error.status).toBe(403);
      }

      // The tokens should be undefined
      expect(tokens).toBeUndefined();
    });

    it("should throw if user logged out", async () => {
      // Sign up the user and obtain the refresh token
      const _tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
        bookstoreId: bookstore.id,
      });

      const rt = _tokens.refresh_token;

      // Get the user ID from the refresh token
      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      // Logout the user to set hashedRt to null
      await authService.logout(userId);

      let tokens: Tokens | undefined;
      try {
        // Attempt to refresh tokens for a logged-out user
        tokens = await authService.refreshTokens(userId, rt);
      } catch (error) {
        // Expecting a 403 Forbidden error
        expect(error.status).toBe(403);
      }

      // The tokens should be undefined
      expect(tokens).toBeUndefined();
    });

    it("should throw if refresh token incorrect", async () => {
      await prisma.cleanDatabase();

      // Sign up the user and obtain the refresh token
      const _tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
        bookstoreId: bookstore.id,
      });

      const rt = _tokens.refresh_token;

      // Get the user ID from the refresh token
      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      let tokens: Tokens | undefined;

      try {
        // Attempt to refresh tokens with an incorrect refresh token
        tokens = await authService.refreshTokens(userId, "incorrect refresh token");
      } catch (error) {
        // Expecting a 403 Forbidden error
        expect(error.status).toBe(403);
      }

      // The tokens should be undefined
      expect(tokens).toBeUndefined();
    });

    it("should refresh tokens", async () => {
      await prisma.cleanDatabase();
      // Sign up the user again and obtain the access token and refresh token
      const _tokens = await authService.signupLocal({
        email: user.email,
        password: user.password,
        bookstoreId: bookstore.id,
      });

      const rt = _tokens.refresh_token;
      const at = _tokens.access_token;

      // Get the user ID from the refresh token
      const decoded = decode(rt);
      const userId = Number(decoded?.sub);

      // Wait for 1 second to ensure the new tokens will have a different signature
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });

      // Call the refreshTokens method
      const tokens = await authService.refreshTokens(userId, rt);

      // Assertions
      expect(tokens).toBeDefined();

      // The refreshed tokens should be different from the original ones
      expect(tokens.access_token).not.toBe(at);
      expect(tokens.refresh_token).not.toBe(rt);
    });
  });
});
