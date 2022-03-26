import { MongoClient, MongoClientOptions } from "mongodb";
import { Session, User } from "~/lib/authentication";
import { IQuestion } from "~/lib/question";
import { MONGO_URL } from "./env";
import {
  QuestionSchema,
  VoteAggregation,
  Photo,
  UserSchema,
  VoteSchema,
  GameSchema,
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
export const questionCollection = client
  .db("plurality")
  .collection<IQuestion>("questions");
export const userCollection = client.db("plurality").collection<User>("user");
export const sessionCollection = client
  .db("plurality")
  .collection<Session>("sessions");

const db = client.db("plurality");
export const usersCollection = db.collection<UserSchema>("users");
export const questionsCollection = db.collection<QuestionSchema>("questions");
export const votesCollection = db.collection<VoteSchema>("votes");
export const gamesCollection = db.collection<GameSchema>("games");
