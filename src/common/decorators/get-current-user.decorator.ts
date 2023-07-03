import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { PrismaClient, User as UserModel } from "@prisma/client";

const prisma = new PrismaClient();

export const GetCurrentUser = createParamDecorator(
  async (
    data: string | undefined,
    context: ExecutionContext
  ): Promise<UserModel> => {
    const request = context.switchToHttp().getRequest();

    // Retrieve the user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: request.user["sub"],
      },
    });

    // If user is not found, throw an unauthorized exception
    if (!user) {
      throw new UnauthorizedException("Authenticate first");
    }

    // Return the user object
    return user;
  }
);
