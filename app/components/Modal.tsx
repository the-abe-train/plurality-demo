import { Photo } from "~/api/schemas";
import { SurveySchema, VoteAggregation } from "~/db/schemas";
import Scorebar from "./Scorebar";
import Survey from "./Survey";
import { motion } from "framer-motion";
import xIcon from "~/images/icons/X.svg";
import Backdrop from "./Backdrop";

type ScorebarProps = {
  points: number;
  score: number;
  guesses: VoteAggregation[];
  win: boolean;
};

type SurveyProps = {
  survey: SurveySchema;
  photo: Photo;
};

type Props = {
  scorebarProps: ScorebarProps;
  surveyProps: SurveyProps;
  handleClose: any;
};

const dropIn = {
  hidden: { y: "-100vh", x: "-50%", opacity: 0 },
  visible: {
    y: "-50%",
    x: "-50%",
    opacity: 1,
    transition: { duration: 0.1, type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { y: "100vh", x: "-50%", opacity: 0 },
};

export default ({ scorebarProps, surveyProps, handleClose }: Props) => {
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        className="absolute top-1/2 left-1/2 
      bg-primary1 p-5 rounded-md border border-outline z-30 w-max max-w-[90%]"
        onClick={(e) => e.stopPropagation()}
        variants={dropIn}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <button className="absolute top-3 right-4" onClick={handleClose}>
          <img src={xIcon} alt="X" />
        </button>
        <h2 className="font-header mb-2 text-2xl sm:text-left">
          Share your score!
        </h2>
        <Scorebar {...scorebarProps} instructions={false} />
        <h2 className="font-header mb-2 text-2xl sm:text-left mt-8">
          Respond to an open Survey!
        </h2>
        <Survey {...surveyProps} />
      </motion.div>
    </Backdrop>
  );
};
