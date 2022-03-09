import { json, LoaderFunction, useLoaderData } from "remix";
import Answers from "~/components/Answers";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import Question from "~/components/Question";
import styles from "~/styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader: LoaderFunction = async () => {
  // TODO Apply for production from Unsplash
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const url = `https://api.unsplash.com/photos/random/?client_id=${key}&orientation=landscape`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
  return data;
};

export default function Index() {
  const data = useLoaderData();

  // console.log(data);
  return (
    <div className="absolute w-full top-0 bottom-0 flex flex-col">
      <Header />
      <section className="space-y-3 p-4 flex-grow">
        <h1 className="text-xl text-center">
          <img className="inline" src="./icons/logo.svg" alt="logo" />
          Plurality
        </h1>
        <p className="">
          How well do you know the public opinion? Find out by guessing the most
          common answers to today’s question!
        </p>
        <div className="flex w-full justify-around">
          <div>
            <img src="./icons/play.svg" alt="play" />
            <p>Play</p>
          </div>
          <div>
            <img src="./icons/vote.svg" alt="vote" />
            <p>Vote</p>
          </div>
          <div>
            <img src="./icons/draft.svg" alt="draft" />
            <p>Draft</p>
          </div>
        </div>
        <p>Plurality is a decentralized app.</p>
      </section>
      <section className="m-4 space-y-2">
        <article className="p-4 border-2 rounded-md space-y-2">
          <h2 className="text-lg">Today</h2>
          <p>Can you figure out the most popular answers?</p>
          <Question image={data.urls.raw} id={342} />
          <div className="flex w-full justify-between">
            <p>15.6k Ballots</p>
            <p>|</p>
            <p>3.1k Voters</p>
            <p>|</p>
            <p>54 Unique answers</p>
          </div>
          <div className="flex w-full justify-between">
            <p>Only 14 hours left to play!</p>
            <p>More questions</p>
          </div>
        </article>
        <article className="p-4 border-2 rounded-md space-y-2">
          <h2 className="text-lg">Yesterday</h2>
          <p>Take a look at how you did yesterday’s questions!</p>
          <Question image={data.urls.raw} id={341} />
          <Answers id={341} />
        </article>
      </section>
      <Footer />
    </div>
  );
}
