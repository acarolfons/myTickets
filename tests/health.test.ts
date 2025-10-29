import supertest from "supertest";
import app from "../src/index";

const api = supertest(app)

describe("GET /health", () => {
    it("should return sttaus 200 and message I'm okay!", async() => {
        const { status, text } = await api.get("/health")
        expect(status).toBe(200);
        expect(text).toBe("I'm okay!")
    })  
})