import { Link } from "remix";
import logo from "~/images/icons/logo.svg";

type Props = {
  name?: string;
};

// TODO Connect button should reveal a dropdown on mobile

export default function Header({ name }: Props) {
  return (
    <div
      className="px-4 py-2 border-0 bg-primary2 z-10 w-full"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.4)" }}
    >
      <nav className="flex justify-between items-center max-w-4xl md:mx-auto">
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
            <Link to="/surveys">Surveys</Link>
          </li>
          <li className="hidden md:block">
            <Link to="/draft">Draft</Link>
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
