import supertest from "supertest";
import app from "../src/index";
import prisma from "database";

import { createTicket } from "./factories/tickets-factory";
import { createEvent } from "./factories/event-factory";

const api = supertest(app);

beforeEach(async () => {
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
})

describe("GET /tickets/:eventId", () => {
  it("should return an empty array if no tickets", async () => {
    const event = await createEvent()
    const res = await api.get(`/tickets/${event.id}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  });

  it("should return tickets for an event", async () => {
    const ticket = await createTicket();
    const res = await api.get(`/tickets/${ticket.eventId}`)

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      id: ticket.id,
      code: ticket.code,
      owner: ticket.owner
    });
  })
})