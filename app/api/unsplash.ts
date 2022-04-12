import { UNSPLASH_ACCESS_KEY } from "../util/env";
import { Photo } from "~/lib/api_schemas";

// Unsplash API
export async function fetchPhoto(photoId: string): Promise<Photo> {
  const baseApi = "https://api.unsplash.com/photos/";
  const api = baseApi + photoId + "/?client_id=" + UNSPLASH_ACCESS_KEY;
  const response = await fetch(api);
  const photo = await response.json();
  return photo;
}
