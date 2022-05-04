import { AnimatePresence, motion, useCycle } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "remix";
import guess from "~/images/icons/guess.svg";
import vote from "~/images/icons/vote.svg";
import draft from "~/images/icons/draft.svg";
import user from "~/images/icons/user.svg";
import info from "~/images/icons/info.svg";
import logo from "~/images/icons/empty_logo.svg";

export default () => {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null!);
  function useOutsideAlerter(ref: React.MutableRefObject<HTMLDivElement>) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpen(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useOutsideAlerter(wrapperRef);

  return (
    <nav className="flex drop-shadow-block z-10 relative" ref={wrapperRef}>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{
              width: "50vw",
            }}
            exit={{
              width: 0,
              transition: { duration: 0.3 },
            }}
            className="bg-primary1 fixed -right-4 -top-4 py-14 bottom-0 h-[105vh] overflow-hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setOpen(false)}
            >
              <Link to="/user" className="text-2xl m-5 flex items-center">
                <img
                  src={user}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={24}
                />
                <span>Connect</span>
              </Link>
              <Link to="/surveys" className="text-2xl block m-5">
                <img
                  src={logo}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={24}
                />
                <span>Surveys</span>
              </Link>
              <Link
                to="/surveys/today"
                className="text-xl my-5 mx-8 flex items-center"
              >
                <img
                  src={guess}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={18}
                />
                <span>Guess</span>
              </Link>
              <Link
                to="/surveys/tomorrow"
                className="text-xl my-5 mx-8 flex items-center"
              >
                <img
                  src={vote}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={18}
                />
                Respond
              </Link>
              <Link to="/draft" className="text-xl my-5 mx-8 flex items-center">
                <img
                  src={draft}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={18}
                />
                Draft
              </Link>
              <Link
                to="/help/what-is-plurality"
                className="text-2xl m-5 flex items-center"
              >
                <img
                  src={info}
                  alt="Instruction symbol"
                  className="mr-2 inline"
                  width={24}
                />
                <span>Help</span>
              </Link>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        // @ts-ignore
        onClick={() => setOpen(!open)}
        className="silver w-10 h-9 relative"
      >
        {open ? (
          <>
            <span className="left-1/4 top-2 block absolute h-[2px] w-0 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform rotate-45"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform -rotate-45"></span>
            <span className="left-1/4 top-6 block absolute h-[2px] w-0 bg-black rounded transition-transform"></span>
          </>
        ) : (
          <>
            <span className="left-1/4 top-2 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-4 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
            <span className="left-1/4 top-6 block absolute h-[2px] w-1/2 bg-black rounded transition-transform"></span>
          </>
        )}
      </button>
    </nav>
  );
};