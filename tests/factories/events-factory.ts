import prisma from "database"
import { faker } from '@faker-js/faker';

export async function createEvent(name?: string, date?:string) {
    return await prisma.event.create({
        data:{
            name: name || faker.person.fullName(),
            date: date || faker.date.anytime()  
        }
    })
}

export async function cleanDb() {
    await prisma.event.deleteMany();
}