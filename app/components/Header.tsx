import { Link } from "remix";
import logo from "~/images/icons/logo.svg";

type Props = {
  name?: string;
};

// TODO Connect button should reveal a dropdown on mobile (?)

export default function Header({ name }: Props) {
  return (
    <div className="px-4 py-2 border-0 shadow-md bg-primary2 z-10 w-full">
      <nav className="flex justify-between items-center max-w-4xl mx-4 md:mx-auto">
        <Link to="/">
          <h1
            className="text-2xl text-center font-header font-bold flex items-center 
          justify-center gap-x-2"
          >
            <img className="inline h-6 object-fill" src={logo} alt="logo" />
            <span className="hidden md:inline">Plurality</span>
          </h1>
        </Link>

        <ul className="flex md:space-x-8 items-center">
          <li className="hidden md:block">
            <Link to="/questions">Surveys</Link>
          </li>
          <li className="hidden md:block">
            <Link to="/help/what-is-plurality">Help</Link>
          </li>
          <Link to="/user">
            <button className="silver px-3 py-2">{name || "Connect"}</button>
          </Link>
        </ul>
      </nav>
    </div>
  );
}
