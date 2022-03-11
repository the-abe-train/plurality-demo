import { IAnswer, IQuestion } from "~/lib/question";
import { sumToken } from "~/util/math";
import { statFormat } from "~/util/text";

const defaultQuestion = {
  id: 0,
  text: "",
  votes: 0,
  answers: [{ text: "Brave", token: 7250 }],
};

type Props = {
  question: IQuestion;
  guesses?: IAnswer[];
};

export default function Answers({ question, guesses }: Props) {
  let answers = question.answers.sort((a, b) => b.token - a.token);
  if (guesses) {
    // If a list of guesses was passed, only show those
    answers = guesses.sort((a, b) => b.token - a.token);
  } else {
    // If no list of guesses passed, show up to top 6
    const answerTokens = answers.map((a) => a.token);
    const threshold = answerTokens.sort((a, b) => b - a).at(5);
    if (threshold) {
      answers = answers.filter((a) => a.token >= threshold);
    }
  }
  return (
    <div className="grid grid-cols-2 gap-1 text-sm">
      {answers.map((answer) => {
        const score = statFormat(
          (answer.token / sumToken(question.answers)) * 100
        );
        return (
          <div
            key={answer.text}
            className="flex w-full border-[1px] border-black rounded-sm bg-white p-1"
          >
            <span className="text-sm font-bold w-[50%] overflow-hidden overflow-ellipsis">
              {answer.text}
            </span>
            <span className="ml-1 text-sm flex-grow">{`${score}%`}</span>
            <span>{`${statFormat(answer.token)}B`}</span>
          </div>
        );
      })}
    </div>
  );
}
