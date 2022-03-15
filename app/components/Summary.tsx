import { Link } from "remix";
import { IQuestion } from "~/lib/question";
import { countAnswers, sumToken } from "~/util/math";
import { statFormat } from "~/util/text";
import { timeLeft } from "~/util/time";

type Props = {
  question: IQuestion;
  // closingTime: string;
};

export default function Summary({ question }: Props) {
  const closingTime = timeLeft(question.surveyClosed);

  return (
    <div className="space-y-2">
      <div className="flex w-full justify-between">
        <p>{statFormat(sumToken(question.answers))} Ballots</p>
        <p>|</p>
        <p>{statFormat(question.voters)} Voters</p>
        <p>|</p>
        <p>{countAnswers(question)} Answers</p>
      </div>
      <div className="flex w-full justify-between">
        <p className="max-w-[65%]">{closingTime}</p>
        <Link to="questions" className="underline">
          More questions
        </Link>
      </div>
    </div>
  );
}
