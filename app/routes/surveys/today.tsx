import { LoaderFunction, redirect } from "remix";
import invariant from "tiny-invariant";

import { client } from "~/db/connect.server";
import { surveyByClose } from "~/db/queries";
import { commitSession, getSession } from "~/sessions";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const loader: LoaderFunction = async ({ request }) => {
  // Get datetime objects
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const todaySc = midnight.subtract(1, "day").toDate();

  // Async requests
  const [session, survey] = await Promise.all([
    getSession(request.headers.get("Cookie")),
    surveyByClose(client, todaySc),
  ]);

  // Get questions from db
  invariant(survey, "Today's question not fetched from database");
  const surveyId = survey._id;

  // Redirect not signed-in users to home page
  if (!session.has("user")) {
    // User can play exactly one game if they're not signed in.
    // Check if the player already has a game in the session
    if (session.has("game") && session.get("game") !== surveyId) {
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
    session.set("game", surveyId);

    // Send user to sample page
    return redirect(`/surveys/${surveyId}/sample`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Redirect to Respond if survey close hasn't happened yet
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/surveys/${surveyId}/respond`);
  }

  // Redirect to Guess if the survey is closed
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/surveys/${surveyId}/guess`);
  }
};

export default () => <></>;
