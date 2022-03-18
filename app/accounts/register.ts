import bcrypt from "bcryptjs";
import { user } from "~/util/db";
const { genSalt, hash } = bcrypt;

export async function registerUser(email: string, password: string) {
  // Generate salt
  const salt = await genSalt(10);
  console.log("salt", salt);

  // Hash with salt
  const hashedPassword = await hash(password, salt);
  console.log("hash", hashedPassword);

  // Store in database
  const result = await user.insertOne({
    email: {
      address: email,
      verified: false,
    },
    password: hashedPassword,
  });
  console.log("User ID:", result.insertedId);

  // Return user from database
  return result.insertedId;
}
