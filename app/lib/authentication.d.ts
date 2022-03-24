import { ObjectId } from "mongodb";

export type Session = {
  _id?: ObjectId;
  [name: string]: any;
};

type Email = {
  address: string;
  verified: false;
};

export type User = {
  _id?: ObjectId;
  email: Email;
  password: string;
  name: string;
};
