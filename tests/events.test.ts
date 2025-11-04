import supertest from "supertest";
import app from "../src/index";
import prisma from "database";
import { createEvent } from "./factories/event-factory";

const api = supertest(app);

beforeEach(async () => {
    await prisma.ticket.deleteMany();
    await prisma.event.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("GET /events", () => {
    it("should return an empty array when there are no events", async () => {
        const res = await api.get("/events");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("should return a list of events", async () => {
        const event = await createEvent();

        const res = await api.get("/events");

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toMatchObject({
            id: event.id,
            name: event.name,
        });
    });
});

describe("GET /events/:id", () => {
    it("should return 200 and the event if it exists", async () => {
        const event = await createEvent();

        const res = await api.get(`/events/${event.id}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: event.id,
            name: event.name
        });
    });

    it("should return 404 if event does not exist", async () => {
        const res = await api.get("/events/9999");

        expect(res.status).toBe(404);
    });

    it("should return 400 if id is not a number", async () => {
        const res = await api.get("/events/abc"); 
        expect(res.status).toBe(400);
        expect(res.text).toContain("Invalid id");
      });
      
      it("should return 400 if id is negative", async () => {
        const res = await api.get("/events/-5"); 
        expect(res.status).toBe(400);
        expect(res.text).toContain("Invalid id");
      });
})

describe("POST /events", () => {
    it("should create an event and return 201", async () => {
        const body = { name: "Rock in Rio", date: "2026-09-15T00:00:00.000Z" };
        const res = await api.post("/events").send(body);
  
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            id: expect.any(Number),
            name: body.name,
            date: body.date
        });
    });
  
    it("should return 409 if event name already exists", async () => {
        await createEvent({ name: "Campus Party" });
        const body = { name: "Campus Party", date: "2026-09-15T00:00:00.000Z" };
  
        const res = await api.post("/events").send(body);
  
        expect(res.status).toBe(409);
        expect(res.text).toContain("already registered"); 
    });
  
    it("should return 422 when body is invalid", async () => {
        const body = { name: "", date: "not-a-date" };
        const res = await api.post("/events").send(body);
  
        expect(res.status).toBe(422);
    });
});

describe("PUT /events/:id", () => {
    it("should update an event and return 200", async () => {
      const event = await createEvent({ name: "Old Event" });
      const body = { name: "Updated Event", date: "2026-12-31T00:00:00.000Z" };
  
      const res = await api.put(`/events/${event.id}`).send(body);
  
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: event.id,
        name: body.name,
        date: body.date
      })
    })
  
    it("should return 409 if updating to a name that already exists", async () => {
      const event1 = await createEvent({ name: "Event 1" });
      const event2 = await createEvent({ name: "Event 2" });
  
      const body = { name: "Event 1", date: "2026-12-31T00:00:00.000Z" };
  
      const res = await api.put(`/events/${event2.id}`).send(body);
  
      expect(res.status).toBe(409);
      expect(res.text).toContain("already registered"); 
    })
  
    it("should return 404 if event does not exist", async () => {
      const body = { name: "Nonexistent Event", date: "2026-12-31T00:00:00.000Z" };
  
      const res = await api.put("/events/9999").send(body);
  
      expect(res.status).toBe(404);
      expect(res.text).toContain("not found"); 
    })
  
    it("should return 422 when body is invalid", async () => {
      const event = await createEvent();
      const body = { name: "", date: "invalid-date" };
  
      const res = await api.put(`/events/${event.id}`).send(body);
  
      expect(res.status).toBe(422); 
    })
})

describe("DELETE /events/:id", () => {
    it("should delete an existing event and return 204", async () => {
      const event = await createEvent({ name: "Event to Delete" })
  
      const res = await api.delete(`/events/${event.id}`);
  
      expect(res.status).toBe(204)
  
      const deleted = await prisma.event.findUnique({ where: { id: event.id } })
      expect(deleted).toBeNull();
    })
  
    it("should return 404 if event does not exist", async () => {
      const res = await api.delete("/events/9999");
  
      expect(res.status).toBe(404);
      expect(res.text).toContain("not found"); 
    });
})
  