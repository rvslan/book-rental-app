import { Injectable } from "@nestjs/common";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";
import { PrismaService } from "../prisma/prisma.service";
import { User as UserModel } from "@prisma/client";

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) { }

  async findAll(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return await this.prisma.book.findMany({
      where: {
        bookstoreId: user.bookstoreId,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }
}
