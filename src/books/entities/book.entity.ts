import { Book } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class BookEntity implements Book {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  bookstoreId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
