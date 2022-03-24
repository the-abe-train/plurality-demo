import Footer from "~/components/Footer";
import Header from "~/components/Header";
import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import { Outlet } from "remix";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

export default function User() {
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
