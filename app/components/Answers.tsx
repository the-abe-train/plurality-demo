import { statFormat } from "~/util/text";
import { motion } from "framer-motion";
import { useRef } from "react";
import { VoteAggregation } from "~/db/schemas";

type Props = {
  guesses: VoteAggregation[];
  totalVotes: number;
  score: number;
};

export default function Answers({ guesses, totalVotes, score }: Props) {
  const nodeRef = useRef<HTMLDivElement>(null!);
  const sortedGuesses = guesses.sort((a, z) => z.votes - a.votes);

  return (
    <section>
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
        {sortedGuesses.map((answer, idx) => {
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
                className="text-sm font-bold flex-grow overflow-hidden 
            overflow-ellipsis"
              >
                {answer._id}
              </span>
              <span className="mx-2 text-sm">{`${score}%`}</span>
            </motion.div>
          );
        })}
      </motion.div>
      <div
        className="flex items-center w-40 border-[1px] border-black 
            rounded-sm bg-white p-1 mx-auto my-4"
      >
        <span className="text-sm font-bold w-1/2">Remaining</span>
        <span className="text-sm flex-grow">
          {statFormat((1 - score) * 100)}%
        </span>
      </div>
    </section>
  );
}
