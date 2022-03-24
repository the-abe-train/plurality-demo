import { ObjectId } from "mongodb";
import { Cookie, createSessionStorage } from "remix";
import { userCookie } from "./cookies";
import { sessionCollection as db } from "./server/db";

function createDatabaseSessionStorage(cookie: Cookie) {
  return createSessionStorage({
    cookie,
    async createData(data, expiry) {
      const id = (await db.insertOne({ data, expiry })).insertedId.toString();
      return id;
    },
    async readData(id) {
      return (await db.findOne({ _id: new ObjectId(id) })) || null;
    },
    async updateData(id, data, expiry) {
      await db.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { user: data.user, expiry } },
        { upsert: false }
      );
    },
    async deleteData(id) {
      await db.findOneAndDelete({ _id: new ObjectId(id) });
    },
  });
}

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage(userCookie);

export { getSession, commitSession, destroySession };
