import { IsNotEmpty } from 'class-validator';

export class SearchBooksDto {
  @IsNotEmpty()
  query: string;
}