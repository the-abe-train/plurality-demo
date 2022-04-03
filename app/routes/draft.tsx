import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "remix";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { UserSchema } from "~/lib/schemas";
import { client } from "~/server/db.server";
import { userById } from "~/server/queries";
import { getSession } from "~/sessions";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

type LoaderData = {
  user: UserSchema;
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

  // Return data
  const data = { user };
  return json<LoaderData>(data);
};

export const action: ActionFunction = async ({ request }) => {
  // Verify that the ID is allowed
  // Verify that the Unsplash photo ID exists
  // Send email to me
};

export default function draft() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect wallet"} />
      <main className="container max-w-sm flex-grow px-4">
        <h1 className="font-header text-2xl my-4">Submit a survey question</h1>
        <Form action="post" className="m-4 space-y-3">
          <label htmlFor="id">
            <p className="mt-4">Survey Number</p>
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            name="id"
          />
          <label htmlFor="question">
            <p className="mt-4">Survey Text</p>
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            name="question"
          />
          <label htmlFor="photo">
            <p className="mt-4">Unsplash photo ID</p>
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
            name="photo"
          />
          <button
            className="block w-40 mx-auto px-4 py-2 mt-4 text-sm 
    font-medium leading-5 text-center text-white transition-colors 
    duration-150 bg-blue-600 border border-transparent rounded-lg 
    active:bg-blue-600 hover:bg-blue-700 focus:outline-none 
    focus:shadow-outline-blue"
            type="submit"
          >
            Submit
          </button>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
