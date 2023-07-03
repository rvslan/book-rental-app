import { PrismaClient } from "@prisma/client";
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

const prisma = new PrismaClient();

@ValidatorConstraint({ async: true })
export class BookstoreExistsValidator implements ValidatorConstraintInterface {
  async validate(bookstoreId: number) {
    const bookstore = await prisma.bookstore.findUnique({
      where: { id: bookstoreId },
    });
    return !!bookstore;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Bookstore with id ${args.value} does not exist.`;
  }
}

export function BookstoreExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BookstoreExistsValidator,
    });
  };
}
