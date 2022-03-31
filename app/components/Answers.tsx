import { statFormat } from "~/util/text";
import { motion } from "framer-motion";
import { useRef } from "react";
import { VoteAggregation } from "~/lib/schemas";

type Props = {
  answers: VoteAggregation[];
  guesses: VoteAggregation[];
};

export default function Answers({ answers, guesses }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const guessNames = guesses.map((guess) => guess._id);
  let sortedAnswers = answers
    .sort((a, b) => b.votes - a.votes)
    .filter((answer) => guessNames.includes(answer._id));

  const answerTokens = answers.map((a) => a.votes);
  const threshold = answerTokens.sort((a, b) => b - a).at(5);
  if (threshold) {
    answers = answers.filter((a) => a.votes >= threshold);
  }

  const totalVotes = answers.reduce((sum, vote) => {
    return sum + vote.votes;
  }, 0);

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
            staggerChildren: 0.5,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="grid grid-cols-2 gap-1 text-sm"
      ref={nodeRef}
    >
      {sortedAnswers.map((answer, idx) => {
        const score = statFormat((answer.votes / totalVotes) * 100);
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
            key={answer._id}
            className="flex items-center w-full border-[1px] border-black 
            rounded-sm bg-white p-1"
            variants={variants}
          >
            <span
              className="text-sm font-bold w-[50%] overflow-hidden 
            overflow-ellipsis"
            >
              {answer._id}
            </span>
            <span className="ml-1 text-sm flex-grow">{`${score}%`}</span>
            <span>{`${statFormat(answer.votes)}B`}</span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
