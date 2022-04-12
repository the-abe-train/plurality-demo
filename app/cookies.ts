import { createCookie } from "remix";
import { COOKIE_SIGNATURE } from "./util/env";

export const userCookie = createCookie("user", {
  maxAge: 604_800, // one week
  secrets: [COOKIE_SIGNATURE],
});
