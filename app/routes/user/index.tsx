import { ObjectId } from "mongodb";
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
import { User } from "~/lib/authentication";
import { closeDb, connectDb, userCollection } from "~/server/db";
import { getSession, destroySession } from "../../sessions";

type LoaderData = {
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  // Redirect to log-in page if user not signed in
  if (!userId) {
    return redirect("/user/login");
  }
  const user = await userCollection.findOne({ _id: userId });
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
    const modified = await userCollection.findOneAndUpdate(
      { _id: userId },
      { $set: { name: newName } }
    );
    console.log(modified);
    await closeDb();
    // return modified.value?.name;
  }

  // Handle log-out form
  if (_action === "logOut") {
    console.log("logging out");
    const session = await getSession(request.headers.get("Cookie"));
    // Destroys the session in the database
    // Sends an unauthenticated cookie back to the user
    const cookieString = await destroySession(session);
    await closeDb();
    return redirect("user/login", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }

  return "";
};

export default function LogoutRoute() {
  const data = useLoaderData<LoaderData>();
  const newName = useActionData();

  const [name, setName] = useState(data.user.name);
  return (
    <main className="flex-grow">
      <p>Email: {data.user.email.address}</p>
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
