import { useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import guess from "~/images/icons/guess.svg";
import vote from "~/images/icons/vote.svg";
import draft from "~/images/icons/draft.svg";
import { Link } from "remix";

const instructions = [
  {
    name: "Guess",
    icon: guess,
    text: (
      <>
        <b>Guess</b> the most popular answers to surveys.
      </>
    ),
  },
  {
    name: "Vote",
    icon: vote,
    text: (
      <>
        <b>Respond</b> to survey questions for future games.
      </>
    ),
  },
  {
    name: "Draft",
    icon: draft,
    text: (
      <>
        <b>Draft</b> custom questions for future surveys.
      </>
    ),
  },
];

export default function Instructions() {
  const [helper, setHelper] = useState(instructions[0]["text"]);
  const [icon, setIcon] = useState("");
  const [showPopup, setShowPopup] = useState(false);
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
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.25,
      },
    },
    collapsed: {
      height: "auto",
      opacity: 0,
      transition: {
        duration: 0.25,
      },
    },
  };

  function togglePopup(text: JSX.Element, newIcon: string) {
    if (icon === newIcon) {
      setShowPopup(false);
      setIcon("");
      return;
    }
    setHelper(text);
    setIcon(newIcon);
    setShowPopup(true);
    control.start({
      opacity: [1, 0, 1],
    });
  }

  return (
    <div className="md:my-4 pb-1 w-[358px] md:w-fit inline-block">
      <h2 className="hidden md:block text-2xl font-header">Instructions</h2>
      <div
        className="flex justify-around my-2 space-x-4
        md:flex-col md:bg-primary2 md:rounded-md md:w-80 md:p-3 md:space-y-4 
        md:border-outline md:border md:shadow-lg md:space-x-0"
      >
        {instructions.map((instr) => {
          return (
            <div
              key={instr.name}
              className="flex flex-col items-center pointer"
              onClick={() => togglePopup(instr.text, instr.icon)}
            >
              <h3 className="md:hidden text-black font-header text-2xl">
                {instr.name}
              </h3>
              <div className="flex items-center  p-2 space-x-3">
                <img
                  src={instr.icon}
                  alt={instr.name}
                  className="h-9 lg:block"
                />
                <p className="hidden md:block text-black">{instr.text}</p>
              </div>
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
            className="bg-white border-2 border-black rounded-md md:hidden md:border-0"
          >
            <motion.div
              variants={childVariants}
              className="flex p-2 bg-primary2 md:hidden"
            >
              <img src={icon} alt="Instruction symbol" className="mr-4" />
              <p className="m-0">{helper}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Link className="underline text-sm" to="/help/what-is-plurality">
        Full instructions
      </Link>
    </div>
  );
}
