import dayjs from "dayjs";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
} from "remix";
import { authorizeUser } from "~/server/authorize";
import { getSession, commitSession } from "../../sessions";

export const loader: LoaderFunction = async ({ request }) => {
  // Upon visitng the page, gets the session from the headers
  // If the session has a user ID in it, redirects to home
  // If not, return nothing
  // Close connection to database
  // Return nothing

  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("_id")) {
    return redirect("/");
  }
  return "";
};

export const action: ActionFunction = async ({ request }) => {
  // Creates a session object from the POST request headers
  // Validates the login info using the database
  // If the user is not found, "flashes" and error and redirects to same page
  // If user is found, attaches the user ID to the session
  // Redirects user back to index page with updated session in the cookie

  const session = await getSession(request.headers.get("Cookie"));
  const nextWeek = dayjs().add(7, "day").toDate();

  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ message: "Invalid username/password" });
  }

  const { isAuthorized, userId } = await authorizeUser(email, password);
  if (!isAuthorized) {
    return json({ message: "Invalid username/password" });
  }

  session.set("user", userId);
  const cookieString = await commitSession(session, { expires: nextWeek });
  return redirect("/", {
    headers: {
      "Set-Cookie": cookieString,
    },
  });
};

export default function Login() {
  const data = useActionData();
  return (
    <main className="container flex-grow px-4 my-8">
      <h1 className="font-header text-3xl">Log in</h1>
      <Form className="max-w-md mx-auto space-y-6 my-6" method="post">
        <input
          type="email"
          name="email"
          className="w-full px-4 py-2 text-sm border rounded-md 
        focus:border-blue-400 focus:outline-none focus:ring-1 
        focus:ring-blue-600"
          placeholder="Email Address"
        />

        <input
          className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder="Password"
          type="password"
          name="password"
        />
        <button
          className="block w-40 mx-auto px-4 py-2 mt-4 text-sm 
    font-medium leading-5 text-center text-white transition-colors 
    duration-150 bg-blue-600 border border-transparent rounded-lg 
    active:bg-blue-600 hover:bg-blue-700 focus:outline-none 
    focus:shadow-outline-blue"
          type="submit"
        >
          Log-in
        </button>
      </Form>
      <p>
        Don't have an account?{" "}
        <Link to="/user/signup" className="underline">
          Sign-up
        </Link>
      </p>
      {data?.message && <p className="text-red-700">{data.message}</p>}
    </main>
  );
}
