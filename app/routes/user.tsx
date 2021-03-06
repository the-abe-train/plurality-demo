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
  redirect,
  useLoaderData,
} from "remix";
import { destroySession, getSession } from "~/sessions";
import { UserSchema } from "~/db/schemas";
import { userById } from "~/db/queries";
import { client } from "~/db/connect.server";
import { truncateName } from "~/util/text";

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

  // If there is a userId but no user, destroy the cookie
  if (userId && !user) {
    return redirect("/user/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  const data = { user };
  return json<LoaderData>(data);
};

export default function User() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? truncateName(data.user.name, 5) : "Connect"} />
      <Outlet />
      <Footer />
    </div>
  );
}
