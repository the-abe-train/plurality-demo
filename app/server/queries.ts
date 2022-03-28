import { questionsCollection, usersCollection, gamesCollection } from "./db";
import { QuestionSchema, VoteAggregation, Photo } from "../lib/schemas";
import { UNSPLASH_ACCESS_KEY } from "./env";
import { ObjectId } from "mongodb";

export async function userById(id: ObjectId) {
  return await usersCollection.findOne({
    _id: id,
  });
}

export async function questionById(id: number) {
  return await questionsCollection.findOne({
    _id: id,
  });
}

export async function questionBySurveyClose(surveyClose: Date) {
  return await questionsCollection.findOne({
    surveyClose: surveyClose,
  });
}

type SearchParams = {
  textSearch: RegExp;
  dateSearch: Date;
  idSearch: number;
};

export async function questionBySearch({
  textSearch,
  dateSearch,
  idSearch,
}: SearchParams) {
  return await questionsCollection
    .find({
      $or: [
        { text: { $regex: textSearch } },
        { id: idSearch },
        { surveyClose: dateSearch },
      ],
    })
    .toArray();
}

export async function votesByQuestion(questionId: number) {
  const votes: unknown = await gamesCollection
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

export async function gameByQuestionUser(questionId: number, userId: ObjectId) {
  const result = await gamesCollection.findOneAndUpdate(
    { question: questionId, user: userId },
    { $set: { lastUpdated: new Date() }, $setOnInsert: { guesses: [] } },
    { upsert: true, returnDocument: "after" }
  );
  return result.value;
}

export async function addGuess(gameId: ObjectId, guess: string) {
  const result = await gamesCollection.findOneAndUpdate(
    { _id: gameId },
    { $set: { lastUpdated: new Date() }, $push: { guesses: guess } },
    { upsert: true }
  );
  return result.value;
}

export async function fetchPhoto(question: QuestionSchema): Promise<Photo> {
  const baseApi = "https://api.unsplash.com/photos/";
  const api = baseApi + question.photo + "/?client_id=" + UNSPLASH_ACCESS_KEY;
  const response = await fetch(api);
  const photo = await response.json();
  return photo;
}
