import { ObjectId } from "mongodb";

type Email = {
  address: string;
  verified: boolean;
};

export type UserSchema = {
  _id: ObjectId;
  email: Email;
  password: string;
  name: string;
  createdDate: Date;
  lastUpdated: Date;
};

type SessionData = {
  user: ObjectId;
};

export type SessionSchema = {
  _id?: ObjectId;
  data: SessionData;
};

export type QuestionSchema = {
  _id: number;
  text: string;
  photo: string;
  surveyClose: Date;
  drafted: Date;
};

export type VoteSchema = {
  _id: ObjectId;
  question: number;
  user: ObjectId;
  text: string;
  date: Date;
};

export type GameSchema = {
  _id: ObjectId;
  question: number;
  user: ObjectId;
  guesses: string[];
  win: boolean;
};

export type AnswerOld = {
  text: string;
  token: number;
};

export type QuestionOld = {
  id: number;
  text: string;
  answers: AnswerOld[];
  voters: number;
  surveyClosed: number;
  photoId: string;
};

export type Photo = {
  id: number;
  width: number;
  height: number;
  urls: { large: string; regular: string; raw: string; small: string };
  color: string | null;
  user: {
    username: string;
    name: string;
  };
};

export type VoteAggregation = {
  _id: string;
  votes: number;
};
