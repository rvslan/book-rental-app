import { IsNotEmpty, IsEmail, IsInt, Validate } from "class-validator";
import { BookstoreExistsValidator } from "../validators/bookstore-exists.validator";
import { EmailNotExists } from "../validators/email-exists.validator";

export class SignupDto {
  @IsNotEmpty()
  @IsEmail()
  @EmailNotExists()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsInt()
  @Validate(BookstoreExistsValidator)
  bookstoreId: number;
}
