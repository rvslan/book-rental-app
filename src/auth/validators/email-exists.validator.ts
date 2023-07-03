import { PrismaClient } from "@prisma/client";
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";

const prisma = new PrismaClient();

@ValidatorConstraint({ name: "emailNotExists", async: true })
export class EmailNotExistsValidator implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { email } });
    return !user;
  }

  defaultMessage(args: ValidationArguments): string {
    return `User with email ${args.value} already exist.`;
  }
}

export function EmailNotExists(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailNotExistsValidator,
    });
  };
}
