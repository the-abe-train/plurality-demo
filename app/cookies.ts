import { createCookie } from "remix";
import { cookieSignature } from "./server/env";

export const userCookie = createCookie("user", {
  maxAge: 604_800, // one week
  secrets: [cookieSignature],
});
