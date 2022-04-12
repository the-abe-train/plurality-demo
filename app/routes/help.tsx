import {
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  Outlet,
  useLoaderData,
} from "remix";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { UserSchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { userById } from "~/db/queries";
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
  user?: UserSchema;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;

  // Return data
  const data = { user };
  return json<LoaderData>(data);
};

export default function help() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <main className="container max-w-4xl flex-grow px-4">
        <Outlet />
        <section className="my-8">
          <h2 className="my-3 text-2xl font-header">Pages</h2>
          <nav className="space-x-3">
            <Link to="/help/what-is-plurality">
              <button
                className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
              >
                What is Plurality?
              </button>
            </Link>
            <Link to="/help/how-to-play">
              <button
                className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
              >
                How to play
              </button>
            </Link>
            <Link to="/help/faq">
              <button
                className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
              >
                FAQ
              </button>
            </Link>
          </nav>
        </section>
      </main>
      <Footer />
    </div>
  );
}
