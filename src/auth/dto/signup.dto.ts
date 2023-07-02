import { IsNotEmpty, IsEmail } from 'class-validator';

export class SignupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  bookstoreId: number;
}