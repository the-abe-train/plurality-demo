import { useEffect, useRef, useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useSubmit,
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
import { truncateEthAddress } from "~/util/text";
import Counter from "~/components/Counter";
import guess from "~/images/icons/guess.svg";
import vote from "~/images/icons/vote.svg";
import draft from "~/images/icons/draft.svg";

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
  console.log("Action", _action);

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
  const submit = useSubmit();
  const deleteFormRef = useRef<HTMLFormElement>(null!);

  useEffect(() => {
    if (actionData?.message) {
      setMessage(actionData.message);
    }
  }, [actionData]);

  async function clickAttachWallet() {
    const newMessage = await attachWallet();
    setMessage(newMessage);
  }

  function confirmDeleteAccount() {
    const confirmed = confirm("Are you sure you want to delete your account?");
    if (confirmed) {
      const newFormData = new FormData(deleteFormRef.current);
      newFormData.set("_action", "delete");
      submit(newFormData, {
        method: "post",
        action: "/user?index",
        replace: true,
      });
    }
  }

  // TODO get data for statistics

  const [name, setName] = useState(user.name || "");
  return (
    <main
      className="container max-w-4xl flex-grow px-4 flex flex-col
    md:grid grid-rows-2 grid-cols-2 grid-flow-row gap-6"
    >
      <section className="space-y-4">
        <h1 className="text-3xl my-3 font-header">Profile</h1>
        <Form method="post">
          <h2 className="text-xl my-2 font-header">Email</h2>
          <div className="block md:flex md:space-x-3">
            <input
              type="email"
              placeholder={user.email.address}
              className="px-3 py-1 border-outline border rounded-sm w-full md:w-auto"
            />
            {actionData?.message === "Verification email sent." && (
              <p>{actionData.message}</p>
            )}
            <div className="my-2 md:my-0 space-x-2">
              <button
                type="submit"
                name="_action"
                value="changeEmail"
                className="silver px-3 py-1"
              >
                Change
              </button>
              <button
                type="submit"
                name="_action"
                value="verifyEmail"
                className="gold px-3 py-1"
                disabled={user.email.verified}
              >
                {user.email.verified ? "Verified" : "Verify"}
              </button>
            </div>
          </div>
        </Form>
        <Form method="post">
          <h2 className="text-xl my-3 font-header">Name</h2>
          <div className="flex space-x-3">
            <input
              type="text"
              value={name}
              name="name"
              className="px-3 py-1 border-outline border rounded-sm"
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              name="_action"
              value="changeName"
              className="silver px-3 py-1"
            >
              Change
            </button>
          </div>
        </Form>
        <Form method="post">
          <h2 className="text-xl my-3 font-header">Ethereum Wallet</h2>
          <div className="flex space-x-3">
            <p className="px-3 py-1 border-outline border rounded-sm bg-white w-[225px]">
              {truncateEthAddress(user.wallet || "") || "Not connected"}
            </p>
            {!user.wallet ? (
              <button className="gold px-3 py-1" onClick={clickAttachWallet}>
                Connect
              </button>
            ) : (
              <button
                type="submit"
                name="_action"
                value="detachWallet"
                className="cancel px-3 py-1"
              >
                Disconnect wallet
              </button>
            )}
          </div>
        </Form>
        {message && <p className="text-red-700">{message}</p>}
      </section>

      <section className="space-y-5">
        <h1 className="text-3xl my-3 font-header">Statistics</h1>
        <div className="flex w-full justify-around">
          <div className="flex space-x-3 items-center">
            <img src={guess} width={32} alt="Guess icon" />
            <Counter value={34} />
          </div>
          <div className="flex space-x-3 items-center">
            <img src={vote} width={32} alt="Respond icon" />
            <Counter value={32} />
          </div>
          <div className="flex space-x-3 items-center">
            <img src={draft} width={32} alt="Draft icon" />
            <Counter value={0} />
          </div>
        </div>
        <table className="table-auto">
          <colgroup>
            <col />
            <col className="bg-yellow-50 border" />
            <col />
            <col className="bg-yellow-50 border w-max" />
          </colgroup>
          <tbody>
            <tr className="border">
              <td className="px-2 py-2">Games won</td>
              <td className="px-2 py-2">34</td>
              <td className="px-2 py-2">Games played</td>
              <td className="px-2 py-2">41</td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2">Responses submitted</td>
              <td className="px-2 py-2">32</td>
              <td className="px-2 py-2">Highest score</td>
              <td className="px-2 py-2">97% (#41)</td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2">Surveys drafted</td>
              <td className="px-2 py-2">3</td>
              <td className="px-2 py-2">Fewest guesses to win</td>
              <td className="px-2 py-2">4 (#46)</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section className="">
        <h1 className="text-3xl my-3 font-header">Account</h1>
        <div className="flex space-x-3">
          <Form method="post" className="space-x-4">
            <button
              type="submit"
              name="_action"
              value="logOut"
              className="silver px-3 py-1"
            >
              Logout
            </button>
          </Form>
          <Form method="post" className="space-x-4" ref={deleteFormRef}>
            <button
              // type="submit"
              // name="_action"
              // value="delete"
              className="cancel px-3 py-1"
              onClick={confirmDeleteAccount}
            >
              Delete
            </button>
          </Form>
        </div>
      </section>
      <section className="mb-6">
        <h1 className="text-3xl my-3 font-header">Survey tokens</h1>
        <div className="flex space-x-3">
          <a href="https://opensea.io/PluralityGame">
            <button className="gold px-3 py-1">Buy a draft token</button>
          </a>
          <Link to="/draft">
            <button className="gold px-3 py-1">Submit a draft</button>
          </Link>
        </div>
      </section>
    </main>
  );
}
