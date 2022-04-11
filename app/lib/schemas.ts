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
  wallet?: string;
  createdDate: Date;
  lastUpdated: Date;
};

export type SessionSchema = {
  _id?: ObjectId;
  data?: any;
  user?: string;
  expiry?: Date;
};

export type QuestionSchema = {
  _id: number;
  text: string;
  photo: string;
  surveyClose: Date;
  drafted: Date;
};

export type GameSchema = {
  _id: ObjectId;
  question: number;
  user: ObjectId;
  guesses: VoteAggregation[];
  win?: boolean;
  vote?: {
    text: string;
    date: Date;
  };
  totalVotes: number;
  lastUpdated: Date;
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
  errors?: string[];
};

export type VoteAggregation = {
  _id: string;
  votes: number;
};
