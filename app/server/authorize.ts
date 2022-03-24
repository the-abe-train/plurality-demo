import bcrypt from "bcryptjs";
import { userCollection } from "~/server/db";
const { genSalt, hash, compare } = bcrypt;

export async function registerUser(email: string, password: string) {
  // Check if user already exists
  const existingUser = await userCollection.findOne({
    "email.address": email,
  });
  console.log(existingUser);
  if (existingUser) throw "User with that email already exists.";

  // Generate salt
  const salt = await genSalt(10);
  console.log("salt", salt);

  // Hash with salt
  const hashedPassword = await hash(password, salt);
  console.log("hash", hashedPassword);

  // Store in database
  const user = await userCollection.insertOne({
    email: {
      address: email,
      verified: false,
    },
    name: email,
    password: hashedPassword,
  });

  // Return user from database
  return { isAuthorized: true, userId: user.insertedId };
}

export async function authorizeUser(email: string, password: string) {
  // look up user
  // get user password
  // compare password with one in database
  // return boolean of "if password is correct"

  const userData = await userCollection.findOne({
    "email.address": email,
  });

  if (userData) {
    console.log(userData);
    const savedPassword = userData.password;
    const isAuthorized = await compare(password, savedPassword);
    return { isAuthorized, userId: userData._id };
  }
  return { isAuthorized: false, userId: null };
}
