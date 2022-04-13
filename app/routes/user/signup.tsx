import { registerUser } from "~/util/authorize";
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
import { useEffect, useState } from "react";
import { connectUserWallet, gameByQuestionUser } from "~/db/queries";
import { client } from "~/db/connect.server";
import { ObjectId } from "mongodb";
import useConnectWithWallet from "~/hooks/useConnectWithWallet";

export const loader: LoaderFunction = async ({ request }) => {
  // Connect to database
  // Upon visitng the page, gets the session from the headers
  // If the session has a user ID in it, redirects to home
  // If not, return nothing
  // Close connection to database
  // Return nothing

  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("user")) {
    return redirect("/");
  }
  return "";
};

type ActionData = {
  message: string;
};

export const action: ActionFunction = async ({ request }) => {
  // Collect and type-validate input data from form
  // Check if user with that email already exists, and throw error if so
  // Otherwise, salt and hash password, and create new user in db
  // Create new session and set "user" to the userId
  // Add an expiry to the session for one week from now
  // Respond to the client with the new session in cookie and redirect to home

  // Set-up
  const session = await getSession(request.headers.get("Cookie"));
  const nextWeek = dayjs().add(7, "day").toDate();

  // Parse form data
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const verify = form.get("verify") as string;
  const wallet = form.get("wallet") as string;
  const localData = form.get("localData") as string;

  // Successful redirect function
  async function successfulRedirect(userId: ObjectId) {
    session.set("user", userId);
    const cookieString = await commitSession(session, {
      expires: nextWeek,
    });
    return redirect("/", {
      headers: {
        "Set-Cookie": cookieString,
      },
    });
  }

  // Connect with wallet
  if (wallet && typeof wallet === "string") {
    const user = await connectUserWallet(client, wallet);
    if (user.value?._id) {
      return await successfulRedirect(user.value?._id);
    }
  }

  // Validate that all data was entered
  if (!email || !password || !verify) {
    return json<ActionData>({ message: "Please fill out all fields" });
  }

  // Check that password and verify match
  if (password !== verify) {
    return json<ActionData>({ message: "Password fields must match" });
  }

  // Check if username is already taken and register user
  const { isAuthorized, userId } = await registerUser(email, password);
  if (!isAuthorized || !userId) {
    return json<ActionData>({ message: "Username already taken" });
  }

  // If there is a game in the local storage, uplaod it for the user.
  if (localData) {
    const { win, guesses, question } = JSON.parse(localData);
    await gameByQuestionUser({
      client,
      userId,
      questionId: Number(question),
      win: win === "true",
      guesses: JSON.parse(guesses),
    });
  }

  // Create user and redirect to home page
  return await successfulRedirect(userId);
};

export default function signup() {
  const actionData = useActionData<ActionData>();
  const [message, setMessage] = useState("");
  const [localData, setLocalData] = useState("");
  const connectWallet = useConnectWithWallet();

  useEffect(() => {
    if (actionData?.message) {
      setMessage(actionData.message);
    }
  }, [actionData]);

  async function clickWalletConnect() {
    const message = await connectWallet();
    setMessage(message);
  }

  // If the player has already played a sample round, grag that data
  useEffect(() => {
    const question = localStorage.getItem("question");
    const guesses = localStorage.getItem("guesses");
    const win = localStorage.getItem("win");
    setLocalData(JSON.stringify({ question, guesses, win }));
  }, []);

  return (
    <main className="container max-w-md flex-grow px-4 my-8">
      <h1 className="font-header text-3xl">Sign up</h1>
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
        <input
          className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder="Verify password"
          type="password"
          name="verify"
        />
        <input
          className="hidden"
          type="text"
          name="localData"
          value={localData}
          readOnly
        />
        {message && <p className="text-red-700">{message}</p>}
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
      <div className="my-4">
        <button
          className="block w-40 mx-auto px-4 py-2 mt-4 text-sm 
    font-medium leading-5 text-center text-white transition-colors 
    duration-150 bg-blue-600 border border-transparent rounded-lg 
    active:bg-blue-600 hover:bg-blue-700 focus:outline-none 
    focus:shadow-outline-blue"
          onClick={clickWalletConnect}
        >
          Connect with Wallet
        </button>
      </div>
      <p>
        Already have an account?{" "}
        <Link to="/user/login" className="underline">
          Log-in
        </Link>
      </p>
    </main>
  );
}
