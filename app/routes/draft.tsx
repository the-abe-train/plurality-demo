import {
  ActionFunction,
  Form,
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import { useEffect, useState } from "react";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import Tooltip from "~/components/Tooltip";

import { UserSchema } from "~/db/schemas";
import { NFT } from "~/api/schemas";

import { client } from "~/db/connect.server";
import { userById } from "~/db/queries";

import { sendEmail } from "~/api/sendgrid.server";

import { commitSession, getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import { fetchPhoto } from "~/api/unsplash";
import { getNfts } from "~/api/opensea";
import { ADMIN_EMAIL } from "~/util/env";
import AnimatedBanner from "~/components/AnimatedBanner";
import draftSymbol from "~/images/icons/draft.svg";
import openSeaIcon from "~/images/icons/open_sea.svg";
import openSeaJpeg from "~/images/open_sea_logo.jpg";
import NavButton from "~/components/NavButton";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

// TODO email must be verified and wallet must be active connected to send
type LoaderData = {
  user: UserSchema;
  ids: number[];
  nfts?: NFT[];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;
  // console.log("user", user);

  // Redirect not signed-in users to home page
  if (!user) {
    session.flash("message", "You need to be logged-in to draft a survey.");
    return redirect("/user/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Get list of NFTs on account using OpenSea API
  const { wallet } = user;
  if (wallet) {
    try {
      const nfts = await getNfts(wallet);
      const ids = [100];
      const data = { user, ids, nfts };
      return json<LoaderData>(data);
    } catch (e) {
      console.error(e);
    }
  }

  // Get list of IDs that this user is allow to submit surveys for
  // Always just [100] for Web2 version
  const ids = [100];

  // Return data
  const data = { user, ids };
  // console.log(data);
  return json<LoaderData>(data);
};

type ActionData = {
  message: string;
  success: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  // Extract data from form
  const form = await request.formData();
  const id = form.get("id");
  const question = form.get("question");
  const photo = form.get("photo");
  const email = form.get("email");

  // Get user ID from session
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  // Verify the that the data entered exists
  if (
    typeof id !== "string" ||
    id.length <= 0 ||
    typeof question !== "string" ||
    question.length <= 0 ||
    typeof photo !== "string" ||
    photo.length <= 0 ||
    typeof email !== "string" ||
    email.length <= 0
  ) {
    const message = "Please fill out all fields.";
    const success = false;
    return json<ActionData>({ message, success });
  }

  // Verify that the ID is allowed (shouldn't be necessary because of frontend)
  const allowableIds = [100];
  if (!allowableIds.includes(Number(id))) {
    const message = "Survey number is not allowed";
    const success = false;
    return json<ActionData>({ message, success });
  }

  // Verify that the Unsplash photo ID exists
  const checkPhoto = await fetchPhoto(photo);
  if (checkPhoto.errors) {
    const message = "Invalid photo ID";
    const success = false;
    return json<ActionData>({ message, success });
  }

  // Send email with info from the user
  const emailBody = `
  <h3>Contact Details</h3>
  <ul>
    <li>User ID: ${user}</li>
    <li>Email: ${email}</li>
  </ul>
  <h3>Question id</h3>
  <p>${id}</p>
  <h3>Question text</h3>
  <p>${question}</p>
  <h3>Unsplash photo</h3>
  <p>https://unsplash.com/photos/${photo}</p>
  `;
  const subject = "Question Submission";
  const emailTo = ADMIN_EMAIL;
  const sendGridResp = await sendEmail({ emailBody, emailTo, subject });
  if (sendGridResp.status === 200) {
    const message = "Question submitted successfully!";
    const success = true;
    return json<ActionData>({ message, success });
  }

  // Tell user that it failed for unknown reason
  const message =
    "Unkown error ocurred. Please reach out to The Abe Train on Twitter for assistance.";
  const success = false;
  return json<ActionData>({ message, success });
};

export default function draft() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  const [showForm, setShowForm] = useState(true);

  const nfts = loaderData.nfts ? [...loaderData.nfts] : [];

  useEffect(() => {
    if (actionData?.success) {
      setShowForm(false);
    }
  }, [actionData]);

  // TODO decide if we want to keep the "light" backdrop on all pages or use a solid colour

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={loaderData.user ? loaderData.user.name : "Connect"} />
      <AnimatedBanner text="Draft" icon={draftSymbol} />
      <main
        className="container max-w-4xl flex-grow px-4 flex flex-col
    md:grid grid-cols-2 grid-flow-row gap-x-6 md:my-6"
      >
        <section>
          <h2 className="font-header text-2xl">Your Survey Tokens</h2>
          <div className="grid grid-cols-3 items-center justify-items-center my-4">
            {nfts.length > 0 &&
              nfts.map((nft, idx) => {
                if (nft.image_url) {
                  return (
                    <img
                      key={idx}
                      src={nft.image_url}
                      alt={nft.name}
                      width={100}
                    />
                  );
                }
                return (
                  <img key={idx} src={openSeaJpeg} alt={nft.name} width={100} />
                );
              })}
          </div>
          {nfts.length <= 0 && (
            <p className="my-4">
              You have no Draft Tokens. You can purchase one from{" "}
              <a href="https://opensea.io/PluralityGame" className="underline">
                OpenSea
              </a>
              .
            </p>
          )}
          <a href="https://opensea.io/PluralityGame">
            <button className="gold px-3 py-2 my-6 flex space-x-1 items-center mx-auto">
              <span>Buy a Token</span>
              <img src={openSeaIcon} alt="OpenSea" className="inline" />
            </button>
          </a>
        </section>
        <section>
          <h2 className="font-header text-2xl">Draft a Survey</h2>
          {showForm && (
            <Form method="post" className="my-4 space-y-3">
              <label htmlFor="id" className="space-x-4">
                <span className="mt-4">Survey Number</span>
                <select name="id" className="min-w-[80px]">
                  {loaderData.ids.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="question">
                <p className="mt-4">Survey question</p>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                name="question"
              />
              <label htmlFor="photo" className="flex items-center space-x-2">
                <p>Unsplash photo ID </p>
                <Tooltip
                  text="The string of characters at the end of the URL for 
              any photo on unsplash.com"
                />
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                name="photo"
              />
              <label htmlFor="email" className="flex items-center space-x-2">
                <p>Email address</p>
                <Tooltip text="We will use this email address to reach you about your submission." />
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                name="email"
                placeholder={loaderData.user.email.address}
              />
              <div>
                <button
                  className="gold px-6 py-2 block mx-auto my-6"
                  type="submit"
                  disabled={transition.state !== "idle"}
                >
                  Submit
                </button>
              </div>
              <p className="text-red-700">{actionData?.message}</p>
            </Form>
          )}
          {!showForm && (
            <p>
              Question submitted successfully! If there is any issue with your
              submission, the Plurality team will let you know as soon as
              possible.{" "}
            </p>
          )}
        </section>
        <div className="my-5">
          <div className="flex flex-wrap gap-3 my-3">
            <NavButton name="Guess" />
            <NavButton name="Respond" />
          </div>
          <Link to="/surveys" className="underline text-right w-full">
            Play more Surveys
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
