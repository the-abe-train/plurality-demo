import {
  QuestionSchema,
  VoteAggregation,
  Photo,
  UserSchema,
  GameSchema,
  SessionSchema,
} from "../lib/schemas";
import { UNSPLASH_ACCESS_KEY, DATABASE_NAME } from "./env";
import { MongoClient, ObjectId } from "mongodb";
import { SessionData } from "remix";
import invariant from "tiny-invariant";
import { THRESHOLD } from "~/util/gameplay";
import { truncateEthAddress } from "~/util/text";
import { randomPassword } from "./authorize";

// Connect database
async function connectDb(client: MongoClient) {
  try {
    await client.db(DATABASE_NAME).command({ ping: 1 });
  } catch {
    await client.connect();
    console.log("Connected to DB success 🗃");
  }
  const db = client.db(DATABASE_NAME);
  return db;
}

// Users collection
export async function userById(client: MongoClient, id: ObjectId) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.findOne({
    _id: id,
  });
}

export async function userByEmail(client: MongoClient, email: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.findOne({
    "email.address": email,
  });
}

export async function userByWallet(client: MongoClient, wallet: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.findOne({ wallet });
}

export async function userUpdateWallet(
  client: MongoClient,
  id: ObjectId,
  wallet: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { wallet } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function userUpdateName(
  client: MongoClient,
  id: ObjectId,
  newName: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const modifiedUser = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: { name: newName } },
    { upsert: false, returnDocument: "after" }
  );
  return modifiedUser.value;
}

export async function createUser(
  client: MongoClient,
  email: string,
  password: string
) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const user = await usersCollection.insertOne({
    _id: new ObjectId(),
    email: {
      address: email,
      verified: false,
    },
    name: email,
    password,
    createdDate: new Date(),
    lastUpdated: new Date(),
  });
  return user;
}

export async function connectUserWallet(client: MongoClient, wallet: string) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  const password = await randomPassword(8);
  const user = await usersCollection.findOneAndUpdate(
    { wallet },
    {
      $set: { lastUpdated: new Date() },
      $setOnInsert: {
        _id: new ObjectId(),
        email: {
          address: "example@walletholder.com",
          verified: false,
        },
        name: truncateEthAddress(wallet),
        password,
        createdDate: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return user;
}

export async function deleteUser(client: MongoClient, id: ObjectId) {
  const db = await connectDb(client);
  const usersCollection = db.collection<UserSchema>("users");
  return await usersCollection.deleteOne({ _id: id });
}

// Questions collection
export async function questionById(client: MongoClient, id: number) {
  const db = await connectDb(client);
  const questionsCollection = db.collection<QuestionSchema>("questions");
  return await questionsCollection.findOne({
    _id: id,
  });
}

export async function questionBySurveyClose(
  client: MongoClient,
  surveyClose: Date
) {
  const db = await connectDb(client);
  const questionsCollection = db.collection<QuestionSchema>("questions");
  return await questionsCollection.findOne({
    surveyClose: surveyClose,
  });
}

type SearchParams = {
  client: MongoClient;
  textSearch: RegExp;
  dateSearch: Date;
  idSearch: number;
};

export async function questionBySearch({
  client,
  textSearch,
  dateSearch,
  idSearch,
}: SearchParams) {
  const db = await connectDb(client);
  const questionsCollection = db.collection<QuestionSchema>("questions");
  return await questionsCollection
    .find({
      $or: [
        { text: { $regex: textSearch } },
        { _id: idSearch },
        { surveyClose: dateSearch },
      ],
    })
    .toArray();
}

// Games collection
export async function votesByQuestion(client: MongoClient, questionId: number) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const votes = await gamesCollection
    .aggregate([
      {
        $match: {
          question: questionId,
          vote: {
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: "$vote.text",
          votes: {
            $count: {},
          },
        },
      },
    ])
    .toArray();
  return votes as VoteAggregation[];
}

export async function gameByQuestionUser(
  client: MongoClient,
  questionId: number,
  userId: ObjectId,
  totalVotes?: number
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const result = await gamesCollection.findOneAndUpdate(
    { question: questionId, user: userId },
    {
      $set: { lastUpdated: new Date() },
      $setOnInsert: { guesses: [], win: false },
      $max: { totalVotes },
    },
    { upsert: true, returnDocument: "after" }
  );
  return result.value;
}

export async function addGuess(
  client: MongoClient,
  gameId: ObjectId,
  guess: VoteAggregation
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const updatedGameResult = await gamesCollection.findOneAndUpdate(
    { _id: gameId },
    { $set: { lastUpdated: new Date() }, $push: { guesses: guess } },
    { upsert: true, returnDocument: "after" }
  );
  const updatedGame = updatedGameResult.value;

  // Check if player won
  invariant(updatedGame?.guesses, "Game update failed to add guess");
  const points = updatedGame.guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const absThreshold = updatedGame.totalVotes * (THRESHOLD / 100);
  if (points >= absThreshold) {
    const wonGameResult = await gamesCollection.findOneAndUpdate(
      { _id: gameId },
      { $set: { win: true } },
      { upsert: false, returnDocument: "after" }
    );
    return wonGameResult.value;
  }
  return updatedGame;
}

export async function addVote(
  client: MongoClient,
  gameId: ObjectId,
  voteText: string
) {
  const db = await connectDb(client);
  const gamesCollection = db.collection<GameSchema>("games");
  const updatedGameResult = await gamesCollection.findOneAndUpdate(
    { _id: gameId },
    {
      $set: {
        lastUpdated: new Date(),
        vote: {
          text: voteText,
          date: new Date(),
        },
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  const updatedGame = updatedGameResult.value;
  return updatedGame;
}

// Session queries
export async function createSession(
  client: MongoClient,
  data: SessionData,
  expiry?: Date
) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  const result = await sessionsCollection.insertOne({ ...data, expiry });
  const id = result.insertedId.toString();
  return id;
}

export async function readSession(client: MongoClient, id: string) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  return (await sessionsCollection.findOne({ _id: new ObjectId(id) })) || null;
}

export async function updateSession(
  client: MongoClient,
  id: string,
  data: SessionData,
  expiry?: Date
) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  await sessionsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, expiry } },
    { upsert: true }
  );
}

export async function deleteSession(client: MongoClient, id: string) {
  const db = await connectDb(client);
  const sessionsCollection = db.collection<SessionSchema>("sessions");
  await sessionsCollection.findOneAndDelete({ _id: new ObjectId(id) });
}

// Unsplash API
export async function fetchPhoto(photoId: string): Promise<Photo> {
  const baseApi = "https://api.unsplash.com/photos/";
  const api = baseApi + photoId + "/?client_id=" + UNSPLASH_ACCESS_KEY;
  const response = await fetch(api);
  const photo = await response.json();
  return photo;
}
