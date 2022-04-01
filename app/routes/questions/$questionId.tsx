import {
  json,
  LoaderFunction,
  Outlet,
  redirect,
  useLoaderData,
  useMatches,
} from "remix";
import invariant from "tiny-invariant";
import { client } from "~/server/db.server";
import {
  fetchPhoto,
  gameByQuestionUser,
  questionById,
  votesByQuestion,
} from "~/server/queries";
import { commitSession, getSession } from "~/sessions";
import {
  GameSchema,
  Photo,
  QuestionSchema,
  VoteAggregation,
} from "~/lib/schemas";
import Question from "~/components/Question";

type LoaderData = {
  question: QuestionSchema;
  photo: Photo;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  console.log("User ID", session.get("user"));
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
  const data = { question, photo };

  // Put the survey close information in a session flash so that it can be
  // read by nested route
  session.flash("surveyClose", question.surveyClose);

  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function QuestionId() {
  const loaderData = useLoaderData<LoaderData>();
  useMatches;
  return (
    <main className="container space-y-4 my-4 max-w-lg">
      <section className="p-4 space-y-2">
        <Question question={loaderData.question} photo={loaderData.photo} />
      </section>
      <Outlet />
    </main>
  );
}
