import { Link } from "remix";
import { QuestionSchema, VoteAggregation } from "~/lib/schemas";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

type Props = {
  question: QuestionSchema;
  votes: VoteAggregation[];
  // closingTime: string;
};

export default function Summary({ question, votes }: Props) {
  const surveyClose = dayjs(question.surveyClose);
  const tense = surveyClose > dayjs() ? "s" : "d";
  const closingTime = dayjs().to(surveyClose);
  const totalVotesCast = votes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);

  return (
    <div className="space-y-2">
      {/* <div className="flex w-full justify-between">
        <p>{statFormat(totalVotesCast)} Votes</p>
        <p>|</p>
        <p>X Guesses remaining</p>
        <p>|</p>
        <p>{votes.length} Answers</p>
      </div> */}
      <div className="flex w-full justify-between">
        <p className="max-w-[65%]">
          Survey close{tense} {closingTime}.
        </p>
        <Link to="questions" className="underline">
          More questions
        </Link>
      </div>
    </div>
  );
}
