import { ActionFunction, Form, Outlet, useActionData } from "remix";
import { registerUser } from "~/accounts/register";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import { closeDb, connectDb } from "~/util/db";
import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

export const action: ActionFunction = async ({ request }) => {
  let body = await request.formData();
  let emailParam = body.get("email");
  let passwordParam = body.get("password");

  console.log("email:", emailParam);
  console.log("password:", passwordParam);

  if (typeof emailParam === "string" && typeof passwordParam === "string") {
    await connectDb();
    await registerUser(emailParam, passwordParam);
    await closeDb();
  }

  return "";
};

export default function User() {
  const data = useActionData();

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Form className="max-w-md mx-auto my-8" method="post">
          <div className="mt-16">
            <label className="block text-sm">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 text-sm border rounded-md 
              focus:border-blue-400 focus:outline-none focus:ring-1 
              focus:ring-blue-600"
              placeholder="Email Address"
            />
          </div>
          <div>
            <label className="block mt-4 text-sm">Password</label>
            <input
              className="w-full px-4 py-2 text-sm border rounded-md focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Password"
              type="password"
              name="password"
            />
          </div>
          <button
            className="block w-40 mx-auto px-4 py-2 mt-4 text-sm 
          font-medium leading-5 text-center text-white transition-colors 
          duration-150 bg-blue-600 border border-transparent rounded-lg 
          active:bg-blue-600 hover:bg-blue-700 focus:outline-none 
          focus:shadow-outline-blue"
            type="submit"
          >
            Sign-up
          </button>
          <div className="mt-4 text-center">
            <p className="text-sm">
              Don't have an account yet?{" "}
              <a href="#" className="text-blue-600 hover:underline">
                {" "}
                Sign up.
              </a>
            </p>
          </div>
        </Form>
      </main>
      <Footer />
    </div>
  );
}
