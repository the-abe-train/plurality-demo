import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { MetaFunction } from "remix";
import appleFavicon from "~/images/favicon/apple-touch-icon.png";
import favicon16 from "~/images/favicon/favicon-16x16.png";
import favicon32 from "~/images/favicon/favicon-32x32.png";

import styles from "./styles/app.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    {
      rel: "icon",
      href: appleFavicon,
      type: "image/png",
    },
    {
      rel: "icon",
      href: favicon16,
      type: "image/png",
    },
    {
      rel: "icon",
      href: favicon32,
      type: "image/png",
    },
  ];
};

export const meta: MetaFunction = () => {
  return { title: "Plurality" };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
