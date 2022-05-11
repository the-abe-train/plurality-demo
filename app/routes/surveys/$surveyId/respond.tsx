import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import Survey from "~/components/Survey";
import { GameSchema, SurveySchema } from "~/db/schemas";
import { client } from "~/db/connect.server";
import {
  addVote,
  gameByQuestionUser,
  getLastSurvey,
  surveyByClose,
  surveyById,
} from "~/db/queries";

import { commitSession, getSession } from "~/sessions";
import { Photo } from "~/api/schemas";
import { fetchPhoto } from "~/api/unsplash";

import respondSymbol from "~/images/icons/respond.svg";
import AnimatedBanner from "~/components/AnimatedBanner";
import NavButton from "~/components/NavButton";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type LoaderData = {
  game: GameSchema;
  survey: SurveySchema;
  photo: Photo;
  lastSurvey: SurveySchema;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Params
  const questionId = Number(params.surveyId);

  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

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
  const survey = await surveyById(client, questionId);
  invariant(survey, "No question found!");

  // Redirect to guess if the survey is closed
  const surveyClose = survey.surveyClose;
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/surveys/${questionId}/guess`);
  }

  // Get additional data from db and apis
  const [photo, game, lastSurvey] = await Promise.all([
    fetchPhoto(survey.photo),
    gameByQuestionUser({ client, questionId, userId }),
    getLastSurvey(client),
  ]);
  invariant(game, "Game upsert failed");

  const data = { game, survey, photo, lastSurvey };
  return json<LoaderData>(data);
};

type ActionData = {
  message: string;
  newVoteResult?: string;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Async parse form and session data
  const [form, session] = await Promise.all([
    request.formData(),
    getSession(request.headers.get("Cookie")),
  ]);

  // Parse form
  const newVote = form.get("vote") as string;
  const newDate = form.get("date") as string;
  const { _action } = Object.fromEntries(form);

  // Submitting a vote
  if (_action === "submitResponse") {
    // Reject empty form submissions
    if (!newVote) {
      const message = "Please enter a vote";
      return json<ActionData>({ message });
    }
    // Pull in relevant data
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
  }

  if (_action === "changeSurvey") {
    console.log("New date", newDate);
    const midnight = dayjs(newDate, "America/Toronto").endOf("day").toDate();
    console.log("Midnight", midnight);
    const newSurvey = await surveyByClose(client, midnight);
    console.log("New survey", newSurvey);
    return redirect(`/surveys/${newSurvey?._id}/respond`);
  }
};

export default () => {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const surveyClose = loaderData.survey.surveyClose;
  const lastSurveyClose = loaderData.lastSurvey.surveyClose;
  const [yourVote, setYourVote] = useState(loaderData.game.vote?.text);
  const [enabled, setEnabled] = useState(false);
  const [voteText, setVoteText] = useState("");
  const [datePicker, setDatePicker] = useState(
    dayjs(surveyClose).format("YYYY-MM-DD")
  );
  const [msg, setMsg] = useState(" ");
  const lastSurveyDate = dayjs(lastSurveyClose).format("YYYY-MM-DD");

  // Updates from action data
  useEffect(() => {
    const newVote = actionData?.newVoteResult;
    if (newVote) {
      setEnabled(false);
      setYourVote(newVote);
    }
  }, [actionData]);

  useEffect(() => {
    if (voteText.length < 1 || voteText.length >= 20) {
      setEnabled(false);
    } else if (voteText.includes(" ")) {
      setEnabled(false);
      setMsg("Response cannot contain a space.");
    } else {
      setEnabled(true);
      setMsg(" ");
    }
  }, [voteText]);

  return (
    <>
      <AnimatedBanner text="Respond" icon={respondSymbol} />
      <main
        className="max-w-4xl flex-grow mx-4 md:mx-auto flex flex-col md:flex-row
    mt-8 md:gap-8 gap-4 my-8"
      >
        <section className="md:px-4 py-2 space-y-4">
          {yourVote && (
            <Form
              className="w-full flex justify-between items-center mb-4"
              method="post"
            >
              <label htmlFor="date">Survey closes:</label>
              <input
                type="date"
                name="date"
                id="date"
                value={datePicker}
                onChange={(e) => setDatePicker(e.target.value)}
                min={dayjs().tz("America/Toronto").format("YYYY-MM-DD")}
                max={lastSurveyDate}
                className="border border-black px-2"
              />
              <button
                type="submit"
                className="silver px-3 py-1"
                name="_action"
                value="changeSurvey"
              >
                Change
              </button>
            </Form>
          )}
          <Survey survey={loaderData.survey} photo={loaderData.photo} />
          <Form method="post" className="w-full flex space-x-2 my-4">
            <input
              type="text"
              name="vote"
              className="border border-black py-1 px-2 
            bg-white disabled:bg-gray-300 w-full"
              disabled={!!yourVote}
              placeholder="Type your Survey response here."
              maxLength={20}
              value={voteText}
              onChange={(e) => setVoteText(e.target.value)}
              spellCheck
            />
            <button
              className="silver px-3 py-1"
              type="submit"
              name="_action"
              value="submitResponse"
              disabled={!enabled}
            >
              Enter
            </button>
          </Form>
          {yourVote && (
            <p className="min-h-[2rem]">
              Your response is: <b>{yourVote}</b>
            </p>
          )}
          <p className="min-h-[2rem]">{msg} </p>
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

          <div className="mt-12">
            <div className="flex flex-wrap gap-3 my-3">
              <NavButton name="Guess" />
              <NavButton name="Draft" />
            </div>
            <Link to="/surveys" className="underline text-right w-full">
              Play more Surveys
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};
