import { LoaderFunction, redirect } from "remix";
import { getSession } from "~/sessions";

import dayjs from "dayjs";

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const surveyClose = session.get("surveyClose");
  const questionId = Number(params.questionId);

  // Redirect not signed-in users to home page
  if (!userId) {
    return redirect("/user/login");
  }

  // Redirect to home if there is no survey close
  if (!surveyClose) {
    return redirect(`/`);
  }

  // Redirect to vote if survey close hasn't happened yet
  if (dayjs(surveyClose) > dayjs()) {
    return redirect(`/questions/${questionId}/vote`);
  }

  // Redirect to play if survey close is in the past
  if (dayjs(surveyClose) <= dayjs()) {
    return redirect(`/questions/${questionId}/play`);
  }
};

export default function index() {
  return <div>index</div>;
}
