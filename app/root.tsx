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

import styles from "./styles/app.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    {
      rel: "icon",
      href: "../favicon/apple-touch-icon.png",
      type: "image/png",
    },
    {
      rel: "icon",
      href: "../favicon/favicon-32x32.png",
      type: "image/png",
    },
    {
      rel: "icon",
      href: "../favicon/favicon-16x16.png",
      type: "image/png",
    },
    {
      rel: "../manifest",
      href: "favicon/site.webmanifest",
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
