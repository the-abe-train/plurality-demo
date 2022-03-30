import bcrypt from "bcryptjs";
import { client } from "~/server/db.server";
import { createUser, userByEmail } from "./queries";
const { genSalt, hash, compare } = bcrypt;

export async function registerUser(email: string, password: string) {
  // Check if user already exists
  const existingUser = await userByEmail(client, email);
  if (existingUser) return { isAuthorized: false, userId: null };

  // Generate salt
  const salt = await genSalt(10);
  console.log("salt", salt);

  // Hash with salt
  const hashedPassword = await hash(password, salt);
  console.log("hash", hashedPassword);

  // Store in database
  const user = await createUser(client, email, hashedPassword);

  // Return user from database
  return { isAuthorized: true, userId: user.insertedId };
}

export async function authorizeUser(email: string, password: string) {
  // look up user
  // get user password
  // compare password with one in database
  // return boolean of "if password is correct"

  const userData = await userByEmail(client, email);
  if (userData) {
    console.log(userData);
    const savedPassword = userData.password;
    const isAuthorized = await compare(password, savedPassword);
    return { isAuthorized, userId: userData._id };
  }
  return { isAuthorized: false, userId: null };
}
