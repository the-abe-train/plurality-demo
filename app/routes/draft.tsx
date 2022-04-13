import {
  ActionFunction,
  Form,
  json,
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

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

// TODO email must be verified and wallet must be active connected to send
// TODO link to buy NFT question for players without question in wallet

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
  console.log("user", user);

  // Redirect not signed-in users to home page
  if (!user) {
    session.flash("message", "You need to be logged-in to draft a question.");
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

  // Get list of IDs that this user is allow to submit questions for
  // Always just [100] for Web2 version
  const ids = [100];

  // Return data
  const data = { user, ids };
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

  let nftNames: string[] = [];
  if (loaderData.nfts) {
    nftNames = loaderData.nfts.map((nft) => nft.name);
  }

  useEffect(() => {
    if (actionData?.success) {
      setShowForm(false);
    }
  }, [actionData]);

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={loaderData.user ? loaderData.user.name : "Connect"} />
      <main className="container max-w-sm flex-grow px-4">
        <h1 className="font-header text-2xl my-4">Submit a survey question</h1>
        <h2 className="font-bold text-lg">Your NFTs</h2>
        <ul className="list-inside list-disc">
          {nftNames.length > 0 &&
            nftNames.map((name, idx) => <li key={idx}>{name}</li>)}
        </ul>
        {showForm && (
          <Form method="post" className="m-4 space-y-3">
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
            <button
              className="block w-40 mx-auto px-4 py-2 mt-4 text-sm 
    font-medium leading-5 text-center text-white transition-colors 
    duration-150 bg-blue-600 border border-transparent rounded-lg 
    active:bg-blue-600 hover:bg-blue-700 focus:outline-none 
    focus:shadow-outline-blue"
              type="submit"
              disabled={transition.state !== "idle"}
            >
              Submit
            </button>
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
      </main>
      <p className="m-4">
        Note: while we work out the Web3 aspect of the game, everyone is assumed
        to have the survey token for question #100
      </p>
      <Footer />
    </div>
  );
}
