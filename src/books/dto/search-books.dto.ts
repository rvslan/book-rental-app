import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchBooksDto {
  @ApiProperty()
  @IsNotEmpty()
  query: string;
}
