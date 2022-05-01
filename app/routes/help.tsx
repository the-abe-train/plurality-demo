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
  path: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;

  const { url } = request;
  const path = url.split("/").pop() || "";

  // Return data
  const data = { user, path };
  return json<LoaderData>(data);
};

export default function help() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="bg-primary1 w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <main
        className="flex-grow mx-4 md:mx-auto mb-4 flex flex-col 
      md:flex-row-reverse max-w-4xl my-4"
      >
        <Outlet />
        <nav
          className="grid grid-rows-2 grid-cols-2 gap-y-4 gap-x-10 mx-auto my-4
        md:my-0 md:flex flex-col md:space-y-4 w-max p-2 md:p-4 h-min md:mr-8 card"
        >
          <Link className="md:w-max " to="/help/what-is-plurality">
            What is Plurality?
          </Link>
          <Link className="md:w-max " to="/help/how-to-play">
            How to play
          </Link>
          <Link className="md:w-max " to="/help/faq">
            FAQ
          </Link>
          <Link className="md:w-max " to="/help/terminology">
            Terminology
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
