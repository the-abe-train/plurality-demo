import { closeDb, connectDb } from "~/server/db";
import { registerUser } from "~/server/authorize";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import { commitSession, getSession } from "~/sessions";
import dayjs from "dayjs";

export const loader: LoaderFunction = async ({ request }) => {
  // Connect to database
  // Upon visitng the page, gets the session from the headers
  // If the session has a user ID in it, redirects to home
  // If not, return nothing
  // Close connection to database
  // Return nothing

  await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("_id")) {
    return redirect("/");
  }
  await closeDb();
  return "";
};

export const action: ActionFunction = async ({ request }) => {
  // Collect and type-validate input data from form
  // Connect to database
  // Check if user with that email already exists, and throw error if so
  // Otherwise, salt and hash password, and create new user in db
  // Create new session and set "user" to the userId
  // Add an expiry to the session for one week from now
  // Close connection to database
  // Respond to the client with the new session in cookie and redirect to home

  // Set-up
  await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  const nextWeek = dayjs().add(7, "day").toDate();

  // Parse form data
  let form = await request.formData();
  let email = form.get("email");
  let password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    session.flash("error", "Invalid username/password");
    return json({ message: "Invalid username/password" });
  }

  // Check if username is already taken
  const { isAuthorized, userId } = await registerUser(email, password);
  if (!isAuthorized) {
    console.log("running into problems");
    session.flash("error", "Username already taken");
    return json({ message: "Username already taken" });
  }

  // Create user and redirect to home page
  session.set("user", userId);
  const cookieString = await commitSession(session, {
    expires: nextWeek,
  });
  console.log("Cookie string:", cookieString);
  await closeDb();
  return redirect("/", {
    headers: {
      "Set-Cookie": cookieString,
    },
  });
};

export default function signup() {
  const data = useActionData();
  return (
    <main className="container flex-grow px-4">
      <Form className="max-w-md mx-auto my-8" method="post">
        <div className="mt-16">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-2 text-sm border rounded-md 
        focus:border-blue-400 focus:outline-none focus:ring-1 
        focus:ring-blue-600"
            placeholder="Email Address"
          />
        </div>
        <div>
          <label className="block mt-4 text-sm">Password</label>
          <input
            className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            placeholder="Password"
            type="password"
            name="password"
          />
        </div>
        <button
          className="block w-40 mx-auto px-4 py-2 mt-4 text-sm 
    font-medium leading-5 text-center text-white transition-colors 
    duration-150 bg-blue-600 border border-transparent rounded-lg 
    active:bg-blue-600 hover:bg-blue-700 focus:outline-none 
    focus:shadow-outline-blue"
          type="submit"
        >
          Sign-up
        </button>
      </Form>
      <p>
        Already have an account?{" "}
        <Link to="/user/login" className="underline">
          Log-in
        </Link>
      </p>
      {data?.message && <p className="text-red-700">{data.message}</p>}
    </main>
  );
}
