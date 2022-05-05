import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ObjectId } from "mongodb";
import { client } from "~/db/connect.server";
import { createUser, deleteUser, surveyByClose, userById } from "~/db/queries";

dayjs.extend(utc);
dayjs.extend(timezone);

// Test variables
const email = "fake.abe@gmail.com";
const password = "P4ssw0rd!";
let userId: ObjectId;

test("Create a new user", async () => {
  const newUser = await createUser(client, email, password);
  userId = newUser.insertedId;
  expect(newUser).toBeTruthy();
});

test("Pull the created user from db by ID", async () => {
  const user = await userById(client, userId);
  expect(String(user?._id)).toBe(String(userId));
});

test("Get today's question", async () => {
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const todaySc = midnight.subtract(1, "day").toDate();
  const survey = await surveyByClose(client, todaySc);
  expect(survey?._id).toBeGreaterThan(0);
});

test("Delete the created user", async () => {
  const deletion = await deleteUser(client, userId);
  expect(deletion.acknowledged).toBeTruthy();
});
