const request = require("supertest");
const app = require("../../src/index");
const mongoose = require("mongoose");
const User = require("../../src/models/user");
const faker = require("faker");

const BASE_URL = "/auth";
const TEST_TAG = "TEST_"

describe("User Signup", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.db.collection('users').drop();
    await mongoose.connection.close();
  });

  it("User should signup successfully with valid data", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/signup`)
      .send({
      username: `${TEST_TAG}${faker.internet.userName()}`,
      email: `${TEST_TAG}${faker.internet.email()}`,
      password: `${TEST_TAG}${faker.internet.password()}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Signup successful");

    const userFromDB = await mongoose.connection.db.findOne({ email: response.body.email });
    expect(userFromDB).toBeTruthy();
  });
});
