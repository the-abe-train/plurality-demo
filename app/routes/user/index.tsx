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
  useTransition,
} from "remix";
import { sendEmail } from "~/api/nodemailer";

import useAttachWallet from "~/hooks/useAttachWallet";
import { UserSchema } from "~/db/schemas";
import { authorizeWallet } from "~/util/authorize";
import { client } from "~/db/connect.server";
import {
  deleteUser,
  removeWallet,
  surveysByAuthor,
  userById,
  userGames,
  userUpdateEmail,
  userUpdateName,
  userUpdateWallet,
} from "~/db/queries";
import { createVerifyEmailLink } from "~/util/verify.server";
import { getSession, destroySession } from "../../sessions";
import { statFormat, truncateEthAddress } from "~/util/text";
import AnimatedBanner from "~/components/AnimatedBanner";
import Counter from "~/components/Counter";
import NFTList from "~/components/NFTList";

import guess from "~/images/icons/guess.svg";
import vote from "~/images/icons/respond.svg";
import draft from "~/images/icons/draft.svg";
import userIcon from "~/images/icons/user.svg";
import openSeaIcon from "~/images/icons/open_sea.svg";
import { NFT } from "~/api/schemas";
import { getNfts } from "~/api/opensea";

type LoaderData = {
  user: UserSchema;
  nfts: NFT[];
  userStats: {
    gamesWon: number;
    responsesSubmitted: number;
    gamesPlayed: number;
    surveysDrafted: number;
    highestScore: { survey: number; score: number };
    fewestGuesses: { survey: number; guesses: number };
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;
  // Redirect to log-in page if user not signed in
  if (!user) {
    return redirect("/user/login");
  }

  // Get list of NFTs on account using OpenSea API
  const { wallet } = user;
  const nfts = wallet ? await getNfts(wallet) : [];

  // Get user stats
  const [surveysList, games] = await Promise.all([
    surveysByAuthor(client, userId),
    userGames(client, userId),
  ]);

  const highScoreGame = games
    .filter((game) => game.score > 0)
    .sort((a, z) => z.score - a.score)[0];
  const fewestGuessesGame = games
    .filter((game) => game.guessesToWin > 0)
    .sort((a, z) => a.guessesToWin - z.guessesToWin)[0];

  const userStats = {
    gamesWon: games.filter((game) => game.win).length,
    responsesSubmitted: games.filter((game) => !!game.vote).length,
    gamesPlayed: games.filter((game) => game.guesses.length > 0).length,
    highestScore: {
      survey: highScoreGame.question,
      score: highScoreGame.score,
    },
    fewestGuesses: {
      survey: fewestGuessesGame.question,
      guesses: fewestGuessesGame.guessesToWin,
    },
    surveysDrafted: surveysList.length,
  };

  const data = { user, userStats, nfts };
  return json(data);
};

type ActionData = {
  message: string;
  name?: string;
  email?: string;
};

export const action: ActionFunction = async ({ request }) => {
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Get user info from cookie
  const userId = session.get("user");

  // Parse forms
  const { _action } = Object.fromEntries(form);
  const newEmail = form.get("email");
  const newName = form.get("name");
  const wallet = form.get("wallet");

  // Handle verify email
  if (_action === "verifyEmail") {
    const user = await userById(client, userId);
    if (user) {
      const emailTo = user.email.address;
      const emailLink = await createVerifyEmailLink(emailTo);
      const emailBody = `Click the link below to verify your email!
${emailLink}`;
      const subject = "Verify Email for Plurality";
      // const response = await sendEmail({ emailTo, emailBody, subject });
      const response = await sendEmail({ emailBody, emailTo, subject });
      if (response === 200) {
        const message = "Verification email sent.";
        return json<ActionData>({ message });
      }
    }
  }

  // Handle email change form
  if (_action === "changeEmail" && typeof newEmail === "string") {
    await userUpdateEmail(client, userId, newEmail);
    const message = "Email updated successfully.";
    return json<ActionData>({ message, email: newEmail });
  }

  // Handle name change form
  if (_action === "changeName" && typeof newName === "string") {
    await userUpdateName(client, userId, newName);
    const message = "Name updated successfully.";
    return json<ActionData>({ message, name: newName });
  }

  // Handle attach wallet form
  if (_action === "attachWallet" && typeof wallet === "string") {
    // Check if wallet is already attached to another account
    const { isAuthorized } = await authorizeWallet(userId, wallet);
    if (!isAuthorized) {
      const message = "Wallet is already attached to another account";
      return json<ActionData>({ message });
    }
    return await userUpdateWallet(client, userId, wallet);
  }

  // Handle detach wallet form
  if (_action === "detachWallet") {
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

export default () => {
  const { user, userStats, nfts } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const transition = useTransition();

  const [message, setMessage] = useState("");
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

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email.address || "");
  return (
    <main className="container max-w-4xl flex-grow px-4">
      <AnimatedBanner text={user.name || "User"} icon={userIcon} />
      <div
        className=" flex flex-col
    md:grid grid-cols-2 grid-flow-row gap-8"
      >
        <section className="space-y-4">
          <h2 className="text-2xl mb-3 font-header">Profile</h2>
          <Form method="post">
            <h3 className="text-xl my-2 font-header">Email</h3>
            <div className="block md:flex md:space-x-3">
              <input
                type="email"
                placeholder={user.email.address}
                className="px-3 py-1 border-outline border rounded-sm w-full md:w-auto"
                maxLength={40}
                value={email}
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />
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
                  disabled={
                    user.email.verified ||
                    actionData?.message === "Verification email sent." ||
                    transition.state !== "idle"
                  }
                >
                  {user.email.verified ? "Verified" : "Verify"}
                </button>
              </div>
            </div>
          </Form>
          <Form method="post">
            <h3 className="text-xl my-2 font-header">Name</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={name}
                name="name"
                className="px-3 py-1 border-outline border rounded-sm"
                onChange={(e) => setName(e.target.value)}
                maxLength={16}
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
            <h3 className="text-xl my-2 font-header">Ethereum Wallet</h3>
            <div className="flex space-x-3">
              <p className="px-3 py-1 border-outline border rounded-sm bg-gray-200 w-[225px]">
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
          {message && <p>{message}</p>}
        </section>
        <section className="space-y-5">
          <h2 className="text-2xl my-2 font-header">Statistics</h2>
          <div className="flex w-full justify-around">
            <div className="flex space-x-3 items-center">
              <img src={guess} width={32} alt="Guess icon" />
              <Counter value={userStats.gamesWon} />
            </div>
            <div className="flex space-x-3 items-center">
              <img src={vote} width={32} alt="Respond icon" />
              <Counter value={userStats.responsesSubmitted} />
            </div>
            <div className="flex space-x-3 items-center">
              <img src={draft} width={32} alt="Draft icon" />
              <Counter value={userStats.surveysDrafted} />
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
                <td className="px-2 py-2">{userStats.gamesWon}</td>
                <td className="px-2 py-2">Games played</td>
                <td className="px-2 py-2">{userStats.gamesPlayed}</td>
              </tr>
              <tr className="border">
                <td className="px-2 py-2">Responses submitted</td>
                <td className="px-2 py-2">{userStats.responsesSubmitted}</td>
                <td className="px-2 py-2">Highest score</td>
                <td className="px-2 py-2">
                  {statFormat(userStats.highestScore.score * 100)}% (#
                  {userStats.highestScore.survey})
                </td>
              </tr>
              <tr className="border">
                <td className="px-2 py-2">Surveys drafted</td>
                <td className="px-2 py-2">{userStats.surveysDrafted}</td>
                <td className="px-2 py-2">Fewest guesses to win</td>
                <td className="px-2 py-2">
                  {userStats.fewestGuesses.guesses} (#
                  {userStats.fewestGuesses.survey})
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section className="">
          <h2 className="text-2xl my-2 font-header">Account</h2>
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
                className="cancel px-3 py-1"
                onClick={confirmDeleteAccount}
              >
                Delete
              </button>
            </Form>
          </div>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl my-2 font-header">Survey tokens</h2>
          <NFTList nfts={nfts} />
          <div className="flex space-x-3">
            <a href="https://opensea.io/PluralityGame">
              <button className="gold px-3 py-1 flex items-center space-x-1">
                <span> Buy a draft token </span>
                <img
                  className="inline-block"
                  src={openSeaIcon}
                  alt="Open Sea"
                />
              </button>
            </a>
            <Link to="/draft">
              <button className="gold px-3 py-1">Submit a draft</button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};
