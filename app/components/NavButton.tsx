import { Link } from "remix";

import guessIcon from "~/images/icons/guess.svg";
import respondIcon from "~/images/icons/respond.svg";
import draftIcon from "~/images/icons/draft.svg";

type Name = "Guess" | "Respond" | "Draft";

export default ({ name }: { name: Name }) => {
  switch (name) {
    case "Guess":
      return (
        <Link to="/surveys/today">
          <button className="flex items-center silver rounded-md px-3 py-1">
            <img
              src={guessIcon}
              alt="Guess symbol"
              className="mr-2 inline"
              width={16}
            />
            <span>Guess</span>
          </button>
        </Link>
      );
    case "Respond":
      return (
        <Link to="/surveys/tomorrow">
          <button className="flex items-center silver rounded-md px-3 py-1">
            <img
              src={respondIcon}
              alt="Respond symbol"
              className="mr-2 inline"
              width={16}
            />
            <span>Respond</span>
          </button>
        </Link>
      );
    case "Draft":
      return (
        <Link to="/draft">
          <button className="flex items-center gold rounded-md px-3 py-1">
            <img
              src={draftIcon}
              alt="Guess symbol"
              className="mr-2 inline"
              width={16}
            />
            <span>Draft</span>
          </button>
        </Link>
      );
    default:
      return <></>;
  }
};
