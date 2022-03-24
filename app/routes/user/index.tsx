import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import { closeDb, connectDb, userCollection } from "~/server/db";
import { getSession, destroySession, commitSession } from "../../sessions";

export const loader: LoaderFunction = async ({ request }) => {
  await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  // Redirect to log-in page if user not signed in
  if (!userId) {
    return redirect("/user/login");
  }
  const user = await userCollection.findOne({ _id: userId });
  const data = { user, error: session.get("error") };
  const cookieString = await commitSession(session);
  await closeDb();

  return json(data, {
    headers: {
      "Set-Cookie": cookieString,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  // Destroys the session in the database
  // Sends an unauthenticated cookie back to the user
  await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  const cookieString = await destroySession(session);
  await closeDb();
  return redirect("user/login", {
    headers: {
      "Set-Cookie": cookieString,
    },
  });
};

export default function LogoutRoute() {
  const data = useLoaderData();
  return (
    <main className="flex-grow">
      <p>Email: {data.user.email.address}</p>
      <p>Are you sure you want to log out?</p>
      <Form method="post">
        <button className="border-2 p-2 border-black rounded-sm">Logout</button>
      </Form>
      <Link to="/" className="underline">
        Never mind
      </Link>
    </main>
  );
}
