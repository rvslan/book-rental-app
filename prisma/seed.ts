import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function generateData() {
  try {
    // Generate random bookstores with books
    for (let i = 0; i < 10; i++) {
      const bookstore = await prisma.bookstore.create({
        data: {
          name: faker.company.buzzPhrase(),
          location: faker.location.city(),
          books: {
            createMany: {
              data: [
                {
                  title: faker.lorem.words(3),
                  author: faker.person.firstName(),
                  quantity: faker.number.int({ min: 10, max: 100 }),
                },
                {
                  title: faker.lorem.words(3),
                  author: faker.person.firstName(),
                  quantity: faker.number.int({ min: 1, max: 10 }),
                },
              ],
            },
          },
        },
      });

      console.log(`Created Bookstore: ${bookstore.name}`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

generateData();
