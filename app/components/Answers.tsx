import { IAnswer, IQuestion } from "~/lib/question";
import { sumToken } from "~/util/math";
import { statFormat } from "~/util/text";
import { motion } from "framer-motion";
import { useRef } from "react";

type Props = {
  question: IQuestion;
  guesses?: IAnswer[];
};

export default function Answers({ question, guesses }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null!);

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
    <motion.div
      variants={{
        hidden: {
          height: 0,
          transition: {
            staggerChildren: 0.5,
          },
        },
        visible: {
          height: "auto",
          transition: {
            staggerChildren: 3,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="grid grid-cols-2 gap-1 text-sm"
      ref={nodeRef}
    >
      {answers.map((answer, idx) => {
        const score = statFormat(
          (answer.token / sumToken(question.answers)) * 100
        );
        const variants = {
          hidden: {
            y: 90,
            x: idx % 2 ? "-50%" : "50%",
            opacity: 0,
          },
          visible: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.5,
            },
          },
        };

        return (
          <motion.div
            key={answer.text}
            className="flex w-full border-[1px] border-black rounded-sm bg-white p-1"
            variants={variants}
          >
            <span className="text-sm font-bold w-[50%] overflow-hidden overflow-ellipsis">
              {answer.text}
            </span>
            <span className="ml-1 text-sm flex-grow">{`${score}%`}</span>
            <span>{`${statFormat(answer.token)}B`}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
