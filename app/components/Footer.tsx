import styles from "~/styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Footer() {
  return (
    <div className="grid grid-cols-2 grid-rows-2 p-4 bg-slate-900 text-white">
      <section>
        <h3>Pages</h3>
        <ul>
          <li>Home</li>
          <li>Dashboard</li>
          <li>Help</li>
          <li>Questions</li>
        </ul>
      </section>
      <section>
        <h3>Created by</h3>
        <ul>
          <li>The Abe Train</li>
          <li>El Enrique Olivo</li>
          <li>Contact Us</li>
        </ul>
      </section>
      <section>
        <span>
          <img className="inline" src="./icons/logo.svg" alt="logo" />
          Plurality
        </span>
      </section>
      <section>
        <span>
          Plurality™ is an open source project. We encourage players to raise
          issues and contribute with pull requests!
        </span>
      </section>
    </div>
  );
}
