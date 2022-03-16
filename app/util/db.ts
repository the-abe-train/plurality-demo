import { MongoClient, MongoClientOptions } from "mongodb";
import { IQuestion } from "~/lib/question";

export const mongoUrl = process.env.MONGO_URL ?? "";
export const jwtSignature = process.env.JWT_SIGNATURE ?? "";

console.log(mongoUrl);

interface Options extends MongoClientOptions {
  useNewUrlParser: boolean;
}

const options: Options = { useNewUrlParser: true };

export const client = new MongoClient(mongoUrl, options);

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

export const questions = client
  .db("plurality")
  .collection<IQuestion>("questions");

export async function closeDb() {
  try {
    await client.close();
    console.log("Successfully closed connection to DB 🗃");
  } catch (e) {
    console.error(e);
    await client.close();
  }
}
