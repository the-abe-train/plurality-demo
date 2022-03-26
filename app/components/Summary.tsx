import { Link } from "remix";
import { IQuestion } from "~/lib/question";
import { QuestionSchema, VoteAggregation } from "~/lib/schemas";
import { countAnswers, sumToken } from "~/util/math";
import { statFormat } from "~/util/text";
import { timeLeft } from "~/util/time";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
dayjs.extend(relativeTime);

type Props = {
  question: QuestionSchema;
  votes: VoteAggregation[];
  // closingTime: string;
};

export default function Summary({ question, votes }: Props) {
  // const closingTime = timeLeft(question.surveyClose);
  const surveyClose = dayjs(question.surveyClose);
  const tense = surveyClose > dayjs() ? "s" : "d";
  const closingTime = dayjs().to(surveyClose);
  const answers = votes.map((agg) => agg._id);
  const totalVotesCast = votes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);

  // TODO agg query that counts individual voters
  return (
    <div className="space-y-2">
      <div className="flex w-full justify-between">
        <p>{statFormat(totalVotesCast)} Ballots</p>
        <p>|</p>
        {/* <p>{statFormat(question.voters)} Voters</p> */}
        <p>X Voters</p>
        <p>|</p>
        <p>{votes.length} Answers</p>
      </div>
      <div className="flex w-full justify-between">
        <p className="max-w-[65%]">
          Survey close{tense} {closingTime}
        </p>
        <Link to="questions" className="underline">
          More questions
        </Link>
      </div>
    </div>
  );
}
