import { IQuestion } from "~/lib/question";
import { Photo } from "~/lib/unsplash";

const key = process.env.UNSPLASH_ACCESS_KEY;
const baseApi = "https://api.unsplash.com/photos/";

export async function fetchPhoto(question: IQuestion): Promise<Photo> {
  const api = baseApi + question.photoId + "/?client_id=" + key;
  const response = await fetch(api);
  const photo = await response.json();
  return photo;
}
