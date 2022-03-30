import { useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { UserSchema } from "~/lib/schemas";
import { client } from "~/server/db.server";
import { userById, userUpdateName } from "~/server/queries";
import { getSession, destroySession } from "../../sessions";

type LoaderData = {
  user: UserSchema;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  const user = (await userById(client, userId)) || undefined;
  // Redirect to log-in page if user not signed in
  if (!user) {
    return redirect("/user/login");
  }
  const data = { user };
  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  // Parse forms
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const newName = form.get("name");
  console.log(values);

  // Handle name change form
  if (_action === "changeName" && typeof newName === "string") {
    console.log("changing the name, changing the game");
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("data")?.user;
    const modified = await userUpdateName(client, userId, newName);
  }

  // Handle log-out form
  if (_action === "logOut") {
    console.log("logging out");
    const session = await getSession(request.headers.get("Cookie"));
    // Destroys the session in the database
    // Sends an unauthenticated cookie back to the user
    const cookieString = await destroySession(session);
    console.log("Destroy session cookie string", cookieString);
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
  const newName = useActionData();

  const [name, setName] = useState(user.name || "");
  return (
    <main className="flex-grow">
      <p>Email: {user.email.address}</p>
      <p>Are you sure you want to log out?</p>
      <Form method="post">
        <label>
          Change name:{" "}
          <input
            type="text"
            value={name}
            name="name"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          type="submit"
          name="_action"
          value="changeName"
          className="border-2 p-2 border-black rounded-sm"
        >
          Change
        </button>
      </Form>
      <Form method="post">
        <button
          type="submit"
          name="_action"
          value="logOut"
          className="border-2 p-2 border-black rounded-sm"
        >
          Logout
        </button>
      </Form>
      <Link to="/" className="underline">
        Never mind
      </Link>
    </main>
  );
}
