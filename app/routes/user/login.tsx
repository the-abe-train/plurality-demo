import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
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
import useConnectWithWallet from "~/hooks/useConnectWithWallet";
import { authorizeUser } from "~/util/authorize";
import { client } from "~/db/connect.server";
import { connectUserWallet, gameByQuestionUser } from "~/db/queries";
import { getSession, commitSession } from "../../sessions";

type LoaderData = {
  message: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Upon visitng the page, gets the session from the headers
  // If the session has a user ID in it, redirects to home
  // If not, return nothing
  // Close connection to database
  // Return nothing

  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("user")) {
    return redirect("/");
  }

  const message = session.get("message") || null;
  session.unset("message");
  console.log(message);

  return json<LoaderData>(
    { message },
    {
      headers: {
        // only necessary with cookieSessionStorage
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

type ActionData = {
  message: string;
};

export const action: ActionFunction = async ({ request }) => {
  // Set-up
  const session = await getSession(request.headers.get("Cookie"));
  const nextWeek = dayjs().add(7, "day").toDate();

  // Parse form data
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;
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
  if (wallet) {
    const user = await connectUserWallet(client, wallet);
    if (user.value?._id) {
      return await successfulRedirect(user.value?._id);
    }
  }

  // Reject empty fields
  if (!email || !password) {
    return json<ActionData>({ message: "Please fill out all fields" });
  }

  // Check if user exists in system
  const { isAuthorized, userId } = await authorizeUser(email, password);

  // Reject unauthorized user
  if (!isAuthorized || !userId) {
    return json<ActionData>({ message: "Invalid username/password" });
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

  // Redirect logged-in user to home page
  return await successfulRedirect(userId);
};

export default function Login() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [localData, setLocalData] = useState("");
  const [message, setMessage] = useState(loaderData?.message);
  const connectWallet = useConnectWithWallet();

  // Create account using Ethereum wallet
  async function clickWalletConnect() {
    const message = await connectWallet();
    setMessage(message);
  }

  // Set message to action data message after form submission
  useEffect(() => {
    if (actionData?.message) {
      setMessage(actionData.message);
    }
  }, [actionData]);

  // If the player has already played a sample round, grag that data
  useEffect(() => {
    const question = localStorage.getItem("question");
    const guesses = localStorage.getItem("guesses");
    const win = localStorage.getItem("win");
    setLocalData(JSON.stringify({ question, guesses, win }));
  }, []);

  // TODO if there's an error connecting to the ETH wallet the user should see

  return (
    <main className="container flex-grow px-4 sm:px-0 mx-auto w-full max-w-4xl">
      <h1 className="font-header text-3xl text-center my-4">Log in</h1>
      <section className="flex justify-around flex-col md:flex-row">
        <article className="max-w-sm ">
          <h2 className="md:text-center text-2xl font-header">
            Option 1: Email & Password
          </h2>
          <Form
            className="max-w-md space-y-6 my-6 flex flex-col items-center"
            method="post"
          >
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 text-sm border rounded-md 
        focus:border-blue-400 focus:outline-none focus:ring-1 
        focus:ring-blue-600"
              placeholder="Email Address"
            />
            <input
              className="w-full px-4 py-2 text-sm border rounded-md 
          focus:border-blue-400 focus:outline-none focus:ring-1 
          focus:ring-blue-600"
              placeholder="Password"
              type="password"
              name="password"
            />
            <input
              className="hidden"
              type="text"
              name="localData"
              value={localData}
              readOnly
            />
            <button className="silver px-3 py-2 block" type="submit">
              Log-in
            </button>
          </Form>
        </article>
        <article className="max-w-sm">
          <h2 className="md:text-center text-2xl font-header">
            Option 2: Ethereum wallet
          </h2>
          <div className="my-4 space-y-4">
            <button
              className="gold px-3 py-2 block mx-auto"
              onClick={clickWalletConnect}
            >
              Connect wallet
            </button>
            <p>
              If you have an Ethereum wallet connected to your account, you can
              draft your own survey questions!
            </p>
          </div>
        </article>
      </section>
      <section className="md:mt-8 my-4">
        <p>
          Don't have an account?{" "}
          <Link to="/user/signup" className="underline">
            Sign-up
          </Link>
        </p>
        {message && <p className="text-red-700">{message}</p>}
      </section>
    </main>
  );
}
