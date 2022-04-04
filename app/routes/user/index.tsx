import { useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { UserSchema } from "~/lib/schemas";
import { client } from "~/server/db.server";
import { deleteUser, userById, userUpdateName } from "~/server/queries";
import { getSession, destroySession } from "../../sessions";

type LoaderData = {
  user: UserSchema;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;
  // Redirect to log-in page if user not signed in
  if (!user) {
    return redirect("/user/login");
  }
  const data = { user };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  // Get user info from cookie
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  // Parse forms
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const newName = form.get("name");

  // Handle name change form
  if (_action === "changeName" && typeof newName === "string") {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("user");
    const modified = await userUpdateName(client, userId, newName);
  }

  // Handle log-out form
  if (_action === "logOut") {
    const session = await getSession(request.headers.get("Cookie"));
    // Destroys the session in the database
    // Sends an unauthenticated cookie back to the user
    const cookieString = await destroySession(session);
    return redirect("/", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }

  // Handle delete account
  if (_action === "delete") {
    await deleteUser(client, userId);
    const session = await getSession(request.headers.get("Cookie"));
    const cookieString = await destroySession(session);
    return redirect("/", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }

  return "";
};

export default function LogoutRoute() {
  const { user } = useLoaderData<LoaderData>();

  const [name, setName] = useState(user.name || "");
  return (
    <main className="container max-w-4xl flex-grow px-4">
      <section className="my-8 space-y-4">
        <h1 className="text-2xl my-3">Profile</h1>
        <p>Email: {user.email.address}</p>
        <Form method="post" className="space-x-4 max-w-xs flex items-center">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            value={name}
            name="name"
            className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="submit"
            name="_action"
            value="changeName"
            className="border-2 px-2 border-black rounded-sm"
          >
            Change
          </button>
        </Form>
      </section>
      <section className="my-8">
        <h1 className="text-2xl my-3">Account</h1>
        <div className="flex space-x-3">
          <Form method="post" className="space-x-4">
            <button
              type="submit"
              name="_action"
              value="logOut"
              className="border-2 px-2 border-black rounded-sm"
            >
              Logout
            </button>
          </Form>
          <Form method="post" className="space-x-4">
            <button
              type="submit"
              name="_action"
              value="delete"
              className="border-2 px-2 border-red-700 border-opacity-100 
              text-red-700 rounded-sm"
            >
              Delete
            </button>
          </Form>
        </div>
      </section>
    </main>
  );
}
