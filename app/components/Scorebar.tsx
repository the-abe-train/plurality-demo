import { motion } from "framer-motion";
import { VoteAggregation } from "~/db/schemas";
import { MAX_GUESSES, THRESHOLD } from "~/util/gameplay";
import Counter from "./Counter";

type Props = {
  points: number;
  score: number;
  guesses: VoteAggregation[];
  win: boolean;
};

export default function Scorebar({ points, score, guesses, win }: Props) {
  const remainingGuesses = MAX_GUESSES - guesses.length;

  return (
    <section className="flex flex-col space-y-4 py-4">
      <div
        className="w-3/4 mx-auto bg-gray-200 rounded-full h-2.5 
        dark:bg-gray-700 relative"
      >
        <motion.div
          className="h-2.5 rounded-full"
          style={{ backgroundColor: win ? "green" : "blue" }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 1 }}
        ></motion.div>
        <div
          className="h-full w-1 z-10 bg-black absolute top-0"
          style={{ left: `calc(${THRESHOLD}% - 2px)` }}
        ></div>
      </div>
      <div className="flex justify-center w-full space-x-12">
        <div className="flex flex-col items-center">
          <Counter value={points} />
          <p>Points</p>
        </div>
        <div className="flex flex-col items-center">
          <Counter value={remainingGuesses} />
          <p>Guesses left</p>
        </div>
        <div className="flex flex-col items-center">
          <Counter value={score * 100} percent />
          <p>Score</p>
        </div>
      </div>
    </section>
  );
}
