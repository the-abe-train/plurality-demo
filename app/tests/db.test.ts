import { ObjectId } from "mongodb";
import { client } from "~/server/db.server";
import { createUser, deleteUser, userById } from "~/server/queries";

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

test("Delete the created user", async () => {
  const deletion = await deleteUser(client, userId);
  expect(deletion.acknowledged).toBeTruthy();
});
