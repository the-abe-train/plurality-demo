import { LoaderFunction, redirect } from "remix";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { client } from "~/db/connect.server";
import { surveyByClose } from "~/db/queries";
import { commitSession, getSession } from "~/sessions";

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  // Get datetime objects
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const todaySc = midnight.subtract(1, "day").toDate();

  // Get questions from db
  const question = await surveyByClose(client, todaySc);
  invariant(question, "Today's question not fetched from database");
  const questionId = question._id;

  // Redirect not signed-in users to home page
  if (!userId) {
    // User can play exactly one game if they're not signed in.
    // Check if the player already has a game in the session
    if (session.has("game") && session.get("game") !== questionId) {
      session.flash(
        "message",
        `You need to be logged-in to play more games.
        (You have already played Question ${session.get("game")})`
      );
      return redirect("/user/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Set the sample game for this not-logged-in user
    session.set("game", questionId);

    // Send user to sample page
    return redirect(`/surveys/${questionId}/sample`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Redirect to Respond if survey close hasn't happened yet
  const surveyClose = question.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/surveys/${questionId}/respond`);
  }

  // Redirect to Guess if the survey is closed
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/surveys/${questionId}/guess`);
  }
};

export default () => <></>;
