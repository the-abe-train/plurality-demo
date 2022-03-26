import { Photo } from "./unsplash";

import type { ObjectId } from "mongodb";

export interface IAnswer {
  text: string;
  token: number;
}

export interface IQuestion {
  _id: ObjectId;
  id: number;
  text: string;
  voters: number;
  photoId: string;
  answers: IAnswer[];
  photo?: Photo;
  // TODO change surveyClosed to be an actual JS date object
  surveyClosed: number;
}
