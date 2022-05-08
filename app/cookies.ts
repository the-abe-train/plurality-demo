import { createCookie } from "@remix-run/vercel/node_modules/@remix-run/node";
import { COOKIE_SIGNATURE } from "./util/env";

// TODO add in all the cookie security features here.

export const userCookie = createCookie("user", {
  maxAge: 604_800, // one week
  secrets: [COOKIE_SIGNATURE],
});
