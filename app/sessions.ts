import { Cookie, createSessionStorage } from "remix";
import { userCookie } from "./cookies";
import { client } from "./server/db.server";
import {
  createSession,
  deleteSession,
  readSession,
  updateSession,
} from "./server/queries";

function createDatabaseSessionStorage(cookie: Cookie) {
  return createSessionStorage({
    cookie,
    async createData(data, expiry) {
      const id = createSession(client, data, expiry);
      return id;
    },
    async readData(id) {
      return await readSession(client, id);
    },
    async updateData(id, data, expiry) {
      await updateSession(client, id, data, expiry);
    },
    async deleteData(id) {
      await deleteSession(client, id);
    },
  });
}

const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage(userCookie);

export { getSession, commitSession, destroySession };
