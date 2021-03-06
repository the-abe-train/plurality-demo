import { Link } from "remix";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { useState } from "react";
import guess from "~/images/icons/guess.svg";
import respond from "~/images/icons/respond.svg";
import draft from "~/images/icons/draft.svg";
import logo from "~/images/icons/logo.svg";
import down from "~/images/icons/down.svg";
import empty_logo from "~/images/icons/empty_logo.svg";
import { truncateName } from "~/util/text";

type Props = {
  name?: string;
};

export default function Header({ name }: Props) {
  const [isHover, setIsHover] = useState(false);
  const subMenuAnimate = {
    enter: {
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.25,
      },
      display: "block",
    },
    exit: {
      opacity: 0,
      rotateX: -15,
      transition: {
        duration: 0.25,
        delay: 0.5,
      },
      transitionEnd: {
        display: "none",
      },
    },
  };

  return (
    <div className="py-2 border-0 bg-primary2 z-20 drop-shadow-nav">
      <div className="w-full px-4 flex justify-between max-w-4xl mx-auto items-center">
        <Link to="/" className="flex space-x-2 items-center">
          <p className="font-header text-2xl font-bold">Plurality</p>
          <img className="inline h-6 object-fill" src={logo} alt="logo" />
        </Link>
        <nav className="flex justify-between items-center">
          <ul className="hidden md:flex md:space-x-8 items-center">
            <motion.li
              className="z-20 relative cursor-pointer"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              onClick={() => setIsHover(!isHover)}
            >
              <span>Surveys</span>{" "}
              <img
                src={down}
                alt="Instruction symbol"
                className="mr-2 inline"
                width={12}
              />
              <motion.div
                className="absolute top-8 -left-4 bg-primary2 drop-shadow-nav 
                rounded-md space-y-3 px-4 py-2 w-32"
                initial="exit"
                animate={isHover ? "enter" : "exit"}
                variants={subMenuAnimate}
              >
                <Link to="/surveys/today" className="flex items-center">
                  <img
                    src={guess}
                    alt="Guess symbol"
                    className="mr-2 inline"
                    width={16}
                  />
                  <span>Guess</span>
                </Link>
                <Link to="/surveys/tomorrow" className="flex items-center">
                  <img
                    src={respond}
                    alt="Respond symbol"
                    className="mr-2 inline"
                    width={16}
                  />
                  <span>Respond</span>
                </Link>
                <Link to="/draft" className="flex items-center">
                  <img
                    src={draft}
                    alt="Draft symbol"
                    className="mr-2 inline"
                    width={16}
                  />
                  <span>Draft</span>
                </Link>
                <Link to="/surveys" className="flex items-center">
                  <img
                    src={empty_logo}
                    alt="Logo"
                    className="mr-2 inline"
                    width={16}
                  />
                  <span>Search</span>
                </Link>
              </motion.div>
            </motion.li>
            <li>
              <Link to="/help/what-is-plurality">Help</Link>
            </li>
            <Link to="/user">
              <button className="silver px-3 py-2">{truncateName(name)}</button>
            </Link>
          </ul>
        </nav>
        <div className="md:hidden">
          <Sidebar name={truncateName(name)} />
        </div>
      </div>
    </div>
  );
}
