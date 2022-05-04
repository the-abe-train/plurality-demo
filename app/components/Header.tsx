import { Link } from "remix";
import logo from "~/images/icons/logo.svg";
import Menu from "./Menu";

type Props = {
  name?: string;
};

// TODO Connect button should reveal a dropdown on mobile

export default function Header({ name }: Props) {
  return (
    <div
      className="px-4 py-2 border-0 bg-primary2 z-20"
      style={{ boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.4)" }}
    >
      <div className="w-full flex justify-between max-w-4xl mx-auto items-center">
        <Link to="/">
          <img className="inline h-6 object-fill" src={logo} alt="logo" />
        </Link>
        <nav className="flex justify-between items-center">
          <ul className="hidden sm:flex md:space-x-8 items-center">
            <li>
              <Link to="/surveys">Surveys</Link>
            </li>
            <li>
              <Link to="/draft">Draft</Link>
            </li>
            <li>
              <Link to="/help/what-is-plurality">Help</Link>
            </li>
            <Link to="/user">
              <button className="silver px-3 py-2">{name || "Connect"}</button>
            </Link>
          </ul>
        </nav>
        <div className="sm:hidden relative">
          <Menu />
        </div>
      </div>
    </div>
  );
}
