import { statFormat } from "~/util/text";

const data = [
  {
    id: 341,
    text: "Which browser do you use?",
    votes: 21325,
    answers: [
      { text: "Brave", token: 7250 },
      { text: "Chrome", token: 6184 },
      { text: "Firefox", token: 3412 },
      { text: "Opera", token: 1706 },
      { text: "Edge", token: 912 },
    ],
  },
];

const defaultQuestion = {
  id: 0,
  text: "",
  votes: 0,
  answers: [{ text: "Brave", token: 7250 }],
};

type Props = {
  id: number;
};

export default function Answers({ id }: Props) {
  const question =
    data.find((question) => question.id === id) ?? defaultQuestion;
  const answers = question.answers;
  return (
    <div className="grid grid-cols-2 gap-1 text-sm">
      {answers.map((answer) => {
        const score = ((answer.token / question.votes) * 100).toPrecision(2);
        return (
          <div
            key={answer.text}
            className="flex w-full border-[1px] border-black rounded-sm bg-white p-1"
          >
            <span className="text-sm font-bold w-1/2">{answer.text}</span>
            <span className="text-sm flex-grow">{`${score}%`}</span>
            <span>{`${statFormat(answer.token)}B`}</span>
          </div>
        );
      })}
    </div>
  );
}
