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

describe("POST /tickets", () => {
  it("should create a ticket and return 201", async () => {
    const event = await createEvent()
    const body = { code: "ABC123", owner: "John Doe", eventId: event.id }

    const res = await api.post("/tickets").send(body)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject(body)
  });

  it("should return 409 if ticket code already exists for event", async () => {
    const ticket = await createTicket({ code: "DUPLICATE" })

    const body = { code: "DUPLICATE", owner: "Jane Doe", eventId: ticket.eventId }
    const res = await api.post("/tickets").send(body)

    expect(res.status).toBe(409)
    expect(res.text).toContain("already registered")
  })

  it("should return 403 if event has already happened", async () => {
    const event = await createEvent({ date: new Date(Date.now() - 1000) })
    const body = { code: "OLD", owner: "John Doe", eventId: event.id }

    const res = await api.post("/tickets").send(body);

    expect(res.status).toBe(403);
    expect(res.text).toContain("already happened")
  })
})

describe("PUT /tickets/use/:id", () => {
  it("should mark a ticket as used and return 204", async () => {
    const ticket = await createTicket()

    const res = await api.put(`/tickets/use/${ticket.id}`)

    expect(res.status).toBe(204)

    const updated = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(updated.used).toBe(true);
  });

  it("should return 404 if ticket does not exist", async () => {
    const res = await api.put("/tickets/use/9999")

    expect(res.status).toBe(404)
    expect(res.text).toContain("not found")
  });

  it("should return 403 if ticket already used or event expired", async () => {
    const ticket = await createTicket({ code: "EXPIRED" })
    await prisma.ticket.update({ where: { id: ticket.id }, data: { used: true } });

    const res = await api.put(`/tickets/use/${ticket.id}`)

    expect(res.status).toBe(403)
    expect(res.text).toContain("already happened or ticket was already used")
  })
})