import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import Survey from "~/components/Survey";
import { GameSchema, SurveySchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import { addVote, gameByQuestionUser, surveyById } from "~/db/queries";

import { commitSession, getSession } from "~/sessions";
import { Photo } from "~/api/schemas";
import { fetchPhoto } from "~/api/unsplash";

import respondSymbol from "~/images/icons/vote.svg";
import AnimatedBanner from "~/components/AnimatedBanner";

type LoaderData = {
  game: GameSchema;
  question: SurveySchema;
  photo: Photo;
};

// TODO email should be verified to respond

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const questionId = Number(params.surveyId);

  // Redirect not signed-in users to home page
  if (!userId) {
    session.flash(
      "message",
      "You need to be logged-in to respond to a Survey."
    );
    return redirect("/user/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Get data from db and apis
  const question = await surveyById(client, questionId);
  invariant(question, "No question found!");
  const photo = await fetchPhoto(question.photo);
  invariant(photo, "No photo found!");

  // Redirect to guess if the survey is closed
  const surveyClose = question.surveyClose;
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/surveys/${questionId}/guess`);
  }

  // Get data from db and apis
  const game = await gameByQuestionUser({ client, questionId, userId });
  invariant(game, "Game upsert failed");

  const data = { game, question, photo };
  return json<LoaderData>(data);
};

type ActionData = {
  message: string;
  newVoteResult?: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Parse form
  const body = await request.formData();
  const newVote = body.get("vote");

  // Reject empty form submissions
  if (typeof newVote !== "string") {
    const message = "Please enter a vote";
    return json<ActionData>({ message });
  }

  // Pull in relevant data
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const questionId = Number(params.surveyId);
  const game = await gameByQuestionUser({ client, questionId, userId });
  invariant(game, "Game upsert failed");

  // Update game with new guess
  const updatedGame = await addVote(client, game._id, newVote);
  invariant(updatedGame, "Game update failed");
  const message = "Thank you for voting!";
  const newVoteResult = updatedGame.vote?.text;

  // Accept correct guess
  return json<ActionData>({ message, newVoteResult });
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [yourVote, setYourVote] = useState(loaderData.game.vote?.text);
  const [msg, setMsg] = useState("");

  // Updates from action data
  useEffect(() => {
    const newVote = actionData?.newVoteResult;
    if (newVote) {
      setYourVote(newVote);
    }
  }, [actionData]);

  return (
    <>
      <AnimatedBanner text="Respond" icon={respondSymbol} />
      <main
        className="container max-w-4xl flex-grow px-4 flex flex-col md:flex-row
    mt-8 md:gap-8 gap-4 my-8"
      >
        <section className="md:px-4 py-2 space-y-2 w-max">
          <Survey survey={loaderData.question} photo={loaderData.photo} />
          <Form method="post" className="w-full flex space-x-2">
            <input
              type="text"
              name="vote"
              className="border border-black py-1 px-2 
            bg-white disabled:bg-gray-300 w-full"
              disabled={!!yourVote}
              placeholder="Type your Survey response here."
            />
            <button
              className="silver px-3 py-1"
              type="submit"
              disabled={!!yourVote}
            >
              Enter
            </button>
          </Form>
          {yourVote && (
            <p>
              Your response is: <b>{yourVote}</b>
            </p>
          )}
          {msg && <p>{msg}</p>}
        </section>
        <section>
          <h2 className="font-header mb-2 text-2xl">Instructions</h2>
          <p>Use this page to respond to the survey for an upcoming game!</p>
          <p>Your response to the survey should:</p>
          <ul className="list-disc list-outside ml-8">
            <li>Be only 1 word</li>
            <li>Be spelled correctly (please proof-read carefully!)</li>
            <li>Not have any profanity, obscenity, or hate speech</li>
            <li>Only have standard English letters or numbers</li>
          </ul>
        </section>
      </main>
    </>
  );
};
