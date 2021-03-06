// Origin and blogpost!
// https://webanimation.blog/blog/wavy-text-animation-using-react-hooks-with-framer-motion/
import { motion, AnimatePresence } from "framer-motion";

// Add staggering effect to the children of the container
const letterContainerVariants = {
  before: { transition: { staggerChildren: 0.015 } },
  after: { transition: { staggerChildren: 0.03 } },
};

// Variants for animating each letter
const letterVariants = {
  before: {
    opacity: 0,
    y: 20,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
  after: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
    },
  },
};

type Props = {
  text: string;
  icon?: string;
  size?: string;
};

export default ({ text, icon, size }: Props) => {
  return (
    <AnimatePresence exitBeforeEnter>
      <motion.h1
        className="mb-2 text-4xl font-header text-center my-6 flex items-center 
        w-full justify-center space-x-3 font-bold"
        style={{ fontSize: size ? `${size}px` : "" }}
        variants={letterContainerVariants}
        initial={"before"}
        animate={"after"}
        exit={"before"}
        key={text}
        aria-label={text}
        aria-live={"polite"} // dont do this on production if it loops.
      >
        <div className="inline-flex items-center">
          {Array.from(text).map((letter, index) => (
            <motion.span
              key={`${index}-${letter}`}
              className="relative inline-block w-auto"
              variants={letterVariants}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
          {"\u00A0"}
          {icon && (
            <motion.img
              variants={letterVariants}
              src={icon}
              alt={text}
              width={size || 34}
              className="inline-block"
            />
          )}
        </div>
      </motion.h1>
    </AnimatePresence>
  );
};
