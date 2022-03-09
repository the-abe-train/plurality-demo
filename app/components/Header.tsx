import styles from "~/styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function Header() {
  return (
    <nav className="flex justify-between items-center p-2 mb-4 shadow">
      <img className="inline" src="./icons/logo.svg" alt="logo" />
      <button className="border-2 p-2 rounded-sm">Connect wallet</button>
    </nav>
  );
}
