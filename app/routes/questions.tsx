import { json, LoaderFunction, Outlet, useLoaderData } from "remix";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { UserSchema } from "~/lib/schemas";
import { userById } from "~/server/queries";
import { getSession } from "~/sessions";
import { client } from "~/server/db.server";

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

export default function questions() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
