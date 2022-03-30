import { ObjectId } from "mongodb";
import { Cookie, createSessionStorage } from "remix";
import { userCookie } from "./cookies";
import { SessionSchema } from "./lib/schemas";
import { client } from "./server/db.server";
import {
  createSession,
  deleteSession,
  readSession,
  updateSession,
} from "./server/queries";

// const sc = db.collection<SessionSchema>("sessions");

function createDatabaseSessionStorage(cookie: Cookie) {
  return createSessionStorage({
    cookie,
    async createData(data, expiry) {
      console.log("Session create data");
      const id = createSession(client, data, expiry);
      return id;
    },
    async readData(id) {
      console.log("Session read data");
      return await readSession(client, id);
    },
    async updateData(id, data, expiry) {
      console.log("Session udpate data");
      await updateSession(client, id, data, expiry);
    },
    async deleteData(id) {
      console.log("Session delete data");
      await deleteSession(client, id);
    },
  });
}

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage(userCookie);

export { getSession, commitSession, destroySession };
