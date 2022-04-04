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
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { UserSchema } from "~/lib/schemas";
import { client } from "~/server/db.server";
import { fetchPhoto, userById } from "~/server/queries";
import { getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import { sendEmail } from "~/server/sendgrid";
import { useEffect, useState } from "react";

import helpIcon from "~/images/icons/help.svg";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

type LoaderData = {
  user: UserSchema;
  ids: number[];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;

  // Redirect not signed-in users to home page
  if (!user) {
    return redirect("/user/login");
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
  console.log(id, question, photo, email);
  console.log("Question type", typeof question);
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
    const message = "Please fill out all fields";
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

  // Send email to me
  const sendGridResp = await sendEmail({ email, user, question, id, photo });
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

function Tooltip({ text }: { text: string }) {
  return (
    <div className="relative flex flex-col items-center group h-fit">
      <img src={helpIcon} alt="Help Icon" className="w-5 h-5" />
      <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
        <span
          className="relative z-10 p-2 text-xs leading-none 
      text-white whitespace-no-wrap bg-black shadow-lg w-36"
        >
          {text}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
      </div>
    </div>
  );
}

export default function draft() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    console.log(actionData?.message);
    if (actionData?.success) {
      setShowForm(false);
    }
  }, [actionData]);

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header
        name={loaderData.user ? loaderData.user.name : "Connect wallet"}
      />
      <main className="container max-w-sm flex-grow px-4">
        <h1 className="font-header text-2xl my-4">Submit a survey question</h1>
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
