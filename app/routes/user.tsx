import Footer from "~/components/Footer";
import Header from "~/components/Header";
import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import { getSession } from "~/sessions";
import { UserSchema } from "~/lib/schemas";
import { userById } from "~/server/queries";
import { client } from "~/server/db.server";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

type LoaderData = {
  user: UserSchema | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  // Data variables
  const data: LoaderData = {
    user: null,
  };

  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  const user = (await userById(client, userId)) || null;
  if (userId) {
    data["user"] = user;
  }

  return json(data);
};

export default function User() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect wallet"} />
      <Outlet />
      <Footer />
    </div>
  );
}
