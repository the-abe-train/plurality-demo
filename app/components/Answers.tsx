import { statFormat } from "~/util/text";

type Answer = {
  text: string;
  token: number;
};

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

type Props = {
  id: number;
};

export default function Answers({ id }: Props) {
  const question = data.find((question) => question.id === id);
  const answers: Answer[] = question
    ? question.answers
    : [{ text: "", token: 0 }];
  return (
    <div className="grid grid-cols-2">
      {answers.map((answer) => {
        return (
          <div className="flex justify-between w-full border-2">
            <span>{answer.text}</span>
            <span>{statFormat(answer.token)} B</span>
          </div>
        );
      })}
    </div>
  );
}
