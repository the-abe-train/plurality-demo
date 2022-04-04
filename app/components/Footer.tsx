import styles from "~/styles/app.css";
import whiteLogo from "~/images/white_logo.svg";
import { Link, LinksFunction } from "remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function Footer() {
  return (
    <footer className="bg-[#292929] p-4 text-white text-sm">
      <div className="flex justify-between flex-wrap max-w-4xl container space-y-2">
        <section>
          <div className="font-header text-xl space-x-1 flex items-center">
            <img className="inline h-5" src={whiteLogo} alt="logo" />
            <span>Plurality</span>
          </div>
          <p>© Plurality {new Date().getFullYear()}</p>
        </section>
        <section className="col-start-2">
          <h3 className="font-bold">Pages</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/user">Profile</Link>
            </li>
            <li>
              <Link to="/help/what-is-plurality">Help</Link>
            </li>
            <li>
              <Link to="/questions">Questions</Link>
            </li>
          </ul>
        </section>
        <section className="col-start-2">
          <h3 className="font-bold">Resources</h3>
          <ul>
            <li>
              <Link to="/">Privacy policy</Link>
            </li>
            <li>
              <Link to="/">Environmental assesment</Link>
            </li>
            <li>
              <Link to="/">Open-source code</Link>
            </li>
          </ul>
        </section>
        <section className="col-start-3">
          <h3 className="font-bold">Created by</h3>
          <ul>
            <li>
              <a href="https://twitter.com/theAbeTrain">The Abe Train</a>
            </li>
            <li>
              <a href="https://twitter.com/enriqueolivojr">El Enrique Olivo</a>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  );
}
