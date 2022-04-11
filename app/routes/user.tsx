import Footer from "~/components/Footer";
import Header from "~/components/Header";
import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import {
  json,
  LinksFunction,
  LoaderFunction,
  Outlet,
  useLoaderData,
} from "remix";
import { getSession } from "~/sessions";
import { UserSchema } from "~/lib/schemas";
import { userById } from "~/server/queries";
import { client } from "~/server/db.server";

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
  const data = { user };
  return json<LoaderData>(data);
};

export default function User() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <Outlet />
      <p className="m-4 container max-w-xl mx-auto block">
        Note: while we work out the Web3 aspect of the game, connecting to
        Plurality is managed by traditional username and password
        authentication.
      </p>
      <Footer />
    </div>
  );
}
