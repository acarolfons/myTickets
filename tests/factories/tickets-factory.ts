import prisma  from "database";
import { faker } from "@faker-js/faker";
import { createEvent } from "./event-factory";

export async function createTicket(custom?: { code?: string, eventId?: number }) {
  const event = custom?.eventId 
    ? await prisma.event.findUnique({ where: { id: custom.eventId } }) 
    : await createEvent();
  const code = custom?.code ?? faker.string.alphanumeric(10);

  return await prisma.ticket.create({
    data: {
      code,
      owner: faker.person.fullName(),
      eventId: event.id
    }
  });
}
