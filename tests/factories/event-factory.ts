import { faker } from "@faker-js/faker";
import prisma from "database";

export async function createEvent(data: any = {}) {
  return prisma.event.create({
    data: {
      name: data.name ?? faker.lorem.words(2) + Date.now(), // garante unique
      date: data.date ?? faker.date.future(),
    }
  });
}
