import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import play from "~/images/play.svg";
import vote from "~/images/play.svg";
import draft from "~/images/play.svg";

const instructions = [
  {
    name: "Play",
    icon: play,
    text: "Guess the most popular answers to surveys with respondants from around the world.",
  },
  {
    name: "Vote",
    icon: vote,
    text: "Use the Ballot token to participate in tomorrow’s surveys.",
  },
  {
    name: "Draft",
    icon: draft,
    text: "Submit custom questions to be a part of upcoming surveys.",
  },
];

export default function Instructions() {
  const [helper, setHelper] = useState(instructions[0]["text"]);
  const [icon, setIcon] = useState(instructions[0]["icon"]);
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

  return (
    <section className="m-4 pb-1 flex-grow">
      <h1
        className="text-4xl text-center font-header font-bold flex items-center 
    w-full justify-center gap-x-2 mt-6"
        onClick={() => setShowPopup(false)}
      >
        <img
          className="inline h-8 object-fill"
          src="./icons/logo.svg"
          alt="logo"
        />
        <span>Plurality</span>
      </h1>
      <div className="flex w-full justify-around my-4">
        {instructions.map((instr) => {
          return (
            <div
              key={instr.name}
              className="flex flex-col items-center pointer"
              onClick={() => {
                setHelper(instr.text);
                setIcon(instr.icon);
                setShowPopup(true);
                control.start({
                  opacity: [1, 0, 1],
                });
              }}
            >
              <h3 className="text-[#012A36] font-header text-2xl">
                {instr.name}
              </h3>
              <div
                className="flex items-center bg-white sm:border-2 
        border-black rounded-md p-2 space-x-3"
              >
                <img
                  src={instr.icon}
                  alt="play"
                  className="h-9 sm:hidden lg:block"
                />
                <p className="hidden sm:block sm:w-44 lg:w-60">{instr.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <AnimatePresence initial={false}>
          {showPopup && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={containerVariants}
              className="bg-white border-2 border-black rounded-md"
            >
              <motion.div
                variants={childVariants}
                // animate={control}
                className="flex p-2"
              >
                <img src={icon} alt="Instruction symbol" className="mr-4" />
                <p className="m-0">{helper}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

{
  /* <div className="bg-white border-2 border-black p-2 rounded-md flex sm:hidden">
<img src={icon} alt="" className="mr-4" />
<p>{helper}</p>
</div> */
}
