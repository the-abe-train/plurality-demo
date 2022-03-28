import { MongoClient, MongoClientOptions } from "mongodb";
import { MONGO_URL } from "./env";
import {
  QuestionSchema,
  UserSchema,
  GameSchema,
  SessionSchema,
} from "../lib/schemas";

interface Options extends MongoClientOptions {
  useNewUrlParser: boolean;
}

const options: Options = { useNewUrlParser: true };

export const client = new MongoClient(MONGO_URL, options);

// Database connections
export async function connectDb() {
  try {
    await client.connect();
    // Confirm connection
    await client.db("plurality").command({ ping: 1 });
    console.log("Connected to DB success 🗃");
  } catch (e) {
    console.error(e);
    // If there is a problem close connection to db
    await client.close();
  }
}
export async function closeDb() {
  try {
    await client.close();
    console.log("Successfully closed connection to DB 🗃");
  } catch (e) {
    console.error(e);
    await client.close();
  }
}

// Collections
const db = client.db("plurality");
export const sessionCollection = db.collection<SessionSchema>("sessions");
export const usersCollection = db.collection<UserSchema>("users");
export const questionsCollection = db.collection<QuestionSchema>("questions");
export const gamesCollection = db.collection<GameSchema>("games");
