import supertest from "supertest";
import app from "../src/index";
import prisma from "database";
import { cleanDb, createEvent } from "./factories/events-factory";

const api = supertest(app);

describe("GET /events", () => {
    beforeEach(async () => await cleanDb());

    it("should return all events", async() => {
        const event = await createEvent()
        const { status, body } = await api.get("/events")
        expect(status).toBe(200)
        expect(body).toHaveLength(1)
        expect(body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    date: expect.any(String)
                })
            ])
        )
    })

    it("empty array should retrun []", async() => {
        const { status, body } = await api.get("/events")
        expect(status).toBe(200)
        expect(body).toEqual([])
    })

    describe("GET /events/:id", () => {
        it("should return a specific event", async() => {
            const event = await createEvent()
            const {status, body} = await api.get(`/events/${event.id}`)
            expect(status).toBe(200)
            expect(body).toMatchObject({
                id: event.id,
                name: event.name,
                date: event.date.toISOString()
            })
        })
    })

})


describe("POST /events", () => {
    beforeEach(async () => await cleanDb());

    it("should create a new event", async () => {
        const eventData = {
          name: "Show do Coldplay",
          date: "2025-12-25T22:00:00.000Z"
        };
      
        const { status, body } = await api.post("/events").send(eventData);
        expect(status).toBe(201)
        expect(body).toMatchObject({
            id: expect.any(Number),
            name: eventData.name,
            date: eventData.date
        })
    })    
})

describe("PUT /events/:id", () => {
    beforeEach(async () => await cleanDb());

    it("should update a event", async() => {
        const event = await createEvent();
        const updatedData = {
            name: "Evento Atualizado",
            date: "2026-01-01T22:00:00.000Z"
        };

        const { status, body } = await api.put(`/events/${event.id}`).send(updatedData);
        expect(status).toBe(200);
        expect(body).toMatchObject({
            id: event.id,
            name: updatedData.name,
            date: updatedData.date
        });

        const eventDB = await prisma.event.findUnique({
            where: { id: event.id }
        });

        expect(eventDB).not.toBeNull();
        expect(eventDB?.name).toBe(updatedData.name);
        expect(eventDB?.date.toISOString()).toBe(updatedData.date);
    })
});

describe("DELETE /events/:id", () => {
    it("should delete a event", async() => {
        const event = await createEvent()
        const { status } = await api.delete(`/events/${event.id}`)
        expect(status).toBe(204)

        const eventDB = await prisma.event.findUnique({
            where: { id: event.id }
        });

        expect(eventDB).toBeNull();
    })
})

afterAll(async () => {
    await prisma.$disconnect();
})
