import { LoaderFunction, redirect } from "remix";
import invariant from "tiny-invariant";
import { client } from "~/server/db.server";
import { verifyUser } from "~/server/queries";
import { createVerifyEmailToken } from "~/server/verify.server";

export const loader: LoaderFunction = async ({ params, request }) => {
  console.log("Email:", params.email);
  console.log("hash:", params.hash);
  const { email, hash } = params;
  invariant(email, "Failed to parse email verification string.");
  const verifyToken = await createVerifyEmailToken(email);
  if (hash === verifyToken) {
    await verifyUser(client, email);
    return redirect("/");
  }
};

export default function index() {
  return <div>Verify route</div>;
}
