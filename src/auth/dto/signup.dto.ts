import { IsNotEmpty, IsEmail, IsInt, Validate } from "class-validator";
import { BookstoreExistsValidator } from "../validators/bookstore-exists.validator";
import { EmailNotExists } from "../validators/email-exists.validator";
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @EmailNotExists()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Validate(BookstoreExistsValidator)
  bookstoreId: number;
}
