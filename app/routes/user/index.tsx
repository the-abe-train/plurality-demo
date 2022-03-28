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
import { closeDb, connectDb, usersCollection } from "~/server/db";
import { getSession, destroySession } from "../../sessions";

type LoaderData = {
  user: UserSchema;
};

async function logOut(request: Request) {
  console.log("logging out");
  const session = await getSession(request.headers.get("Cookie"));
  // Destroys the session in the database
  // Sends an unauthenticated cookie back to the user
  const cookieString = await destroySession(session);
  return redirect("user/login", {
    headers: {
      "Set-Cookie": cookieString,
    },
  });
}

export const loader: LoaderFunction = async ({ request }) => {
  await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  const user = await usersCollection.findOne({ _id: userId });
  // Redirect to log-in page if user not signed in
  if (!user) {
    return redirect("/user/login");
  }
  const data = { user };
  await closeDb();

  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  // Connect to database
  await connectDb();

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
    const modified = await usersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: { name: newName } }
    );
    console.log(modified);
    await closeDb();
    // return modified.value?.name;
  }

  // Handle log-out form
  if (_action === "logOut") {
    logOut(request);
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
