import prisma from "database"
import { faker } from '@faker-js/faker';

export async function createEvent() {
    return await prisma.event.create({
        data:{
            name: faker.person.fullName(),
            date: faker.date.anytime()  
        }
    })
}

export async function cleanDb() {
    await prisma.event.deleteMany();
}