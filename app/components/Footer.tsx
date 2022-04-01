import styles from "~/styles/app.css";
import whiteLogo from "~/images/white_logo.svg";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Footer() {
  return (
    <footer className="bg-[#292929] p-4 text-white text-sm">
      <div
        className="grid grid-flow-row md:grid-flow-col auto-rows-min gap-4 sm:gap-6
     md:grid-rows-1 md:grid-cols-6 max-w-4xl container"
      >
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
            <li>Home</li>
            <li>Profile</li>
            <li>Help</li>
            <li>Questions</li>
          </ul>
        </section>
        <section className="col-start-3">
          <h3 className="font-bold">Created by</h3>
          <ul>
            <li>The Abe Train</li>
            <li>El Enrique Olivo</li>
            <li>Contact Us</li>
          </ul>
        </section>
        <section className="col-span-3">
          <span>
            Plurality™ is an open source project. We encourage players to raise
            issues and contribute with pull requests!
          </span>
        </section>
      </div>
    </footer>
  );
}
