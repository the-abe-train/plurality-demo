import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useState } from "react";
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
  const items = [
    {
      name: "Guesses left",
      value: remainingGuesses,
      percentage: false,
      text: (
        <>
          You can have <b>14 guesses</b> left to reach an <b>80% score</b>.
        </>
      ),
    },
    {
      name: "Points",
      value: points,
      percentage: false,
      text: (
        <>
          <b>Points</b> are the number votes received by all correctly guessed
          survey responses.
        </>
      ),
    },
    {
      name: "Score",
      value: score * 100,
      percentage: true,
      text: (
        <>
          <b>Score</b> is the percentage of points acquired out of the total
          points available.
        </>
      ),
    },
  ];
  const [helper, setHelper] = useState(items[0]["text"]);
  const [currentItem, setCurrentItem] = useState("Guesses left");
  const [showPopup, setShowPopup] = useState(true);
  const control = useAnimation();

  const containerVariants = {
    collapsed: {
      height: "0px",
      opacity: 0,
      transition: {
        duration: 0.25,
        when: "afterChildren",
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.25,
        when: "beforeChildren",
      },
    },
  };

  const childVariants = {
    collapsed: {
      height: "auto",
      opacity: 0,
      transition: {
        duration: 0.25,
      },
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.25,
      },
    },
  };

  function togglePopup(text: JSX.Element, name: string) {
    if (name === currentItem) {
      setShowPopup(false);
      setCurrentItem("");
      return;
    }
    setCurrentItem(name);
    setHelper(text);
    setShowPopup(true);
    control.start({
      opacity: [1, 0, 1],
    });
  }

  return (
    <div className="flex flex-col space-y-4 py-4 min-h-[220px]">
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
        {items.map((item) => {
          return (
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => togglePopup(item.text, item.name)}
              key={item.name}
            >
              <Counter value={item.value} percent={item.percentage} />
              <p>{item.name}</p>
            </div>
          );
        })}
      </div>
      <AnimatePresence initial={false}>
        {showPopup && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={containerVariants}
            className="card md:border-0"
          >
            <motion.div
              variants={childVariants}
              className="flex rounded-md bg-primary2 p-3"
            >
              <p className="m-0 h-max">{helper}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
