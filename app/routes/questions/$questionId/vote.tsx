import dayjs from "dayjs";
import { Form, json, LoaderFunction, Outlet, redirect } from "remix";
import invariant from "tiny-invariant";
import { GameSchema, VoteAggregation } from "~/lib/schemas";
import { client } from "~/server/db.server";
import { gameByQuestionUser, votesByQuestion } from "~/server/queries";
import { commitSession, getSession } from "~/sessions";

type LoaderData = {
  votes: VoteAggregation[];
  game: GameSchema;
  message: string;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const surveyClose = session.get("surveyClose");
  console.log("User ID", userId);
  console.log("Survey Close", surveyClose);
  const questionId = Number(params.questionId);

  // Redirect not signed-in users to home page
  if (!userId) {
    return redirect("/user/login");
  }

  // Redirect to vote if survey close hasn't happened yet
  if (dayjs(surveyClose) < dayjs()) {
    return redirect(`/questions/${questionId}/play`);
  }

  // Get data from db and apis
  const votes = await votesByQuestion(client, questionId);
  const totalVotes = votes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);
  const game = await gameByQuestionUser(client, questionId, userId, totalVotes);
  invariant(game, "Game upsert failed");

  const message = game.win ? "You win!" : "";

  const data = { votes, game, message };
  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function vote() {
  return (
    <div>
      <Form>
        <label>
          <p>Respond to suvey</p>
          <input
            type="text"
            className="border-[1px] border-black py-1 px-2 bg-white disabled:bg-gray-300"
          />
        </label>
        <button
          className="px-2 py-1 rounded-sm border-button text-button 
      bg-[#F9F1F0] font-bold border-2 shadow"
          type="submit"
        >
          Enter
        </button>
      </Form>
    </div>
  );
}
