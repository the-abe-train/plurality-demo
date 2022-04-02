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
import Question from "~/components/Question";
import {
  GameSchema,
  Photo,
  QuestionSchema,
  VoteAggregation,
} from "~/lib/schemas";
import { client } from "~/server/db.server";
import {
  addVote,
  fetchPhoto,
  gameByQuestionUser,
  questionById,
} from "~/server/queries";
import { commitSession, getSession } from "~/sessions";

type LoaderData = {
  game: GameSchema;
  question: QuestionSchema;
  photo: Photo;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const questionId = Number(params.questionId);

  // Redirect not signed-in users to home page
  if (!userId) {
    return redirect("/user/login");
  }

  // Get data from db and apis
  const question = await questionById(client, questionId);
  invariant(question, "No question found!");
  console.log(question);
  const photo = await fetchPhoto(question);
  invariant(photo, "No photo found!");

  // Redirect to vote if survey close hasn't happened yet
  const surveyClose = question.surveyClose;
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/questions/${questionId}/play`);
  }

  // Get data from db and apis
  const game = await gameByQuestionUser(client, questionId, userId);
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
  const questionId = Number(params.questionId);
  const game = await gameByQuestionUser(client, questionId, userId);
  invariant(game, "Game upsert failed");

  // Update game with new guess
  const updatedGame = await addVote(client, game._id, newVote);
  invariant(updatedGame, "Game update failed");
  const message = "Thank you for voting!";
  const newVoteResult = updatedGame.vote?.text;

  // Accept correct guess
  return json<ActionData>({ message, newVoteResult });
};

export default function vote() {
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
    <main className="container space-y-4 my-4 max-w-lg">
      <section className="p-4 space-y-2">
        <Question question={loaderData.question} photo={loaderData.photo} />
      </section>
      <Form method="post">
        <label>
          <p>Respond to suvey</p>
          <input
            type="text"
            name="vote"
            className="border-[1px] border-black py-1 px-2 
            bg-white disabled:bg-gray-300"
            disabled={!!yourVote}
          />
        </label>
        <button
          className="px-2 py-1 rounded-sm border-button text-button 
      bg-[#F9F1F0] font-bold border-2 shadow disabled:bg-gray-300"
          type="submit"
          disabled={!!yourVote}
        >
          Enter
        </button>
      </Form>
      {yourVote && (
        <p>
          Your vote is: <b>{yourVote}</b>
        </p>
      )}
      {msg && <p>{msg}</p>}
    </main>
  );
}
