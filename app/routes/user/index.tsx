import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import useAttachWallet from "~/hooks/useAttachWallet";
import { UserSchema } from "~/db/schemas";
import { authorizeWallet } from "~/util/authorize";
import { client } from "~/db/connect.server";
import {
  deleteUser,
  removeWallet,
  userById,
  userUpdateName,
  userUpdateWallet,
} from "~/db/queries";
import { sendEmail } from "~/api/sendgrid.server";
import { createVerifyEmailLink } from "~/util/verify.server";
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

type ActionData = {
  message: string;
};

export const action: ActionFunction = async ({ request }) => {
  // Get user info from cookie
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  // Parse forms
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const newName = form.get("name");
  const wallet = form.get("wallet");

  // Handle verify email
  if (_action === "verifyEmail") {
    const user = await userById(client, userId);
    if (user) {
      const emailTo = user.email.address;
      const emailLink = await createVerifyEmailLink(emailTo);
      const emailBody = `<a href="${emailLink}">Click to verify your email</a>`;
      const subject = "Verify Email for Plurality";
      const response = await sendEmail({ emailTo, emailBody, subject });
      if (response.ok) {
        console.log(`Verification email sent to ${emailTo}!`);
        const message = "Verification email sent.";
        return json<ActionData>({ message });
      }
    }
  }

  // Handle name change form
  if (_action === "changeName" && typeof newName === "string") {
    return await userUpdateName(client, userId, newName);
  }

  // Handle attach wallet form
  if (_action === "attachWallet" && typeof wallet === "string") {
    // Check if wallet is already attached to another account
    const { isAuthorized } = await authorizeWallet(userId, wallet);
    console.log("is authorized", isAuthorized);
    if (!isAuthorized) {
      const message = "Wallet is already attached to another account";
      return json<ActionData>({ message });
    }
    return await userUpdateWallet(client, userId, wallet);
  }

  // Handle detach wallet form
  if (_action === "detachWallet") {
    console.log("Remove wallet");
    return await removeWallet(client, userId);
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
  const [message, setMessage] = useState("");
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const attachWallet = useAttachWallet();

  useEffect(() => {
    if (actionData?.message) {
      setMessage(actionData.message);
    }
  }, [actionData]);

  async function clickAttachWallet() {
    const newMessage = await attachWallet();
    setMessage(newMessage);
  }

  const dontShowVerifyButton =
    actionData?.message === "Verification email sent." || user.email.verified;

  const [name, setName] = useState(user.name || "");
  return (
    <main className="container max-w-4xl flex-grow px-4">
      <section className="my-8 space-y-4">
        <h1 className="text-2xl my-3">Profile</h1>
        <Form method="post" className="space-x-4 max-w-xs flex items-center">
          <p>Email: {user.email.address}</p>
          {user.email.verified && <p>Email verified</p>}
          {actionData?.message === "Verification email sent." && (
            <p>{actionData.message}</p>
          )}
          {!dontShowVerifyButton && (
            <button
              type="submit"
              name="_action"
              value="verifyEmail"
              className="border-2 px-2 border-black rounded-sm"
            >
              Verify email
            </button>
          )}
        </Form>
        <Form method="post" className="space-x-4 max-w-xs flex items-center">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            value={name}
            name="name"
            className="w-full px-4 py-2 text-sm border rounded-md 
            focus:border-blue-400 focus:outline-none focus:ring-1 
            focus:ring-blue-600"
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
        <Form className="space-x-4 max-w-xs flex items-center" method="post">
          <p>Ethereum wallet: {user.wallet}</p>
          {!user.wallet && (
            <button
              className="border-2 px-2 border-black rounded-sm"
              onClick={clickAttachWallet}
            >
              Connect wallet
            </button>
          )}
          {user.wallet && (
            <button
              type="submit"
              name="_action"
              value="detachWallet"
              className="border-2 px-2 border-black rounded-sm"
            >
              Disconnect wallet
            </button>
          )}
        </Form>
        {message && <p className="text-red-700">{message}</p>}
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
