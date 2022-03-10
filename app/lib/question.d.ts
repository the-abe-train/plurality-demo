import { Photo } from "./unsplash";

export interface IAnswer {
  text: string;
  token: number;
}

export interface IQuestion {
  id: number;
  text: string;
  votes: number;
  photoId: string;
  answers: IAnswer[];
  photo?: Photo;
}
