import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

import { jwtSignature } from "./env";

export async function createTokens(sessionToken: string, userId: ObjectId) {
  try {
    // Create refresh token (Session id)
    const refreshToken = jwt.sign(
      {
        sessionToken,
      },
      jwtSignature
    );

    // create access token (session ID, user ID)
    const accessToken = jwt.sign(
      {
        sessionToken,
        userId,
      },
      jwtSignature
    );

    // Return refresh token and access token
    return { accessToken, refreshToken };
  } catch (error) {
    return console.error(error);
  }
}
