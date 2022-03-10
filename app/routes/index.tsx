import { json, LoaderFunction, useLoaderData } from "remix";
import Answers from "~/components/Answers";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import Question from "~/components/Question";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import questionData from "~/data/questions.json";
import { useState } from "react";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

const instructions = [
  {
    name: "Play",
    icon: "./icons/play.svg",
    text: "Guess the most popular answers to surveys with respondants from around the world.",
  },
  {
    name: "Vote",
    icon: "./icons/vote.svg",
    text: "Use the Ballot token to participate in tomorrow’s surveys.",
  },
  {
    name: "Draft",
    icon: "./icons/draft.svg",
    text: "Submit custom questions to be a part of upcoming surveys.",
  },
];

export const loader: LoaderFunction = async () => {
  // Read in data from database here

  // TODO Apply for production from Unsplash
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const baseApi = "https://api.unsplash.com/photos/";
  const data = Promise.all(
    questionData.map(async (question) => {
      const api = baseApi + question.photo + "/?client_id=" + key;
      const response = await fetch(api);
      return response.json();
    })
  );

  return data;
};

export default function Index() {
  const data = useLoaderData();
  const [today, yesterday, tomorrow] = data;

  const [helper, setHelper] = useState("");
  const [icon, setIcon] = useState("");

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col">
      <Header />
      <main className="container">
        <section className="space-y-3 p-4 flex-grow">
          <h1
            className="text-4xl text-center font-header font-bold flex items-center 
          w-full justify-center gap-x-2"
          >
            <img
              className="inline h-8 object-fill"
              src="./icons/logo.svg"
              alt="logo"
            />
            <span>Plurality</span>
          </h1>
          <div className="flex w-full justify-around">
            {instructions.map((instr) => {
              return (
                <div
                  key={instr.name}
                  className="flex flex-col items-center pointer"
                  onClick={() => {
                    setHelper(instr.text);
                    setIcon(instr.icon);
                  }}
                >
                  <h3 className="text-accent font-header text-2xl">
                    {instr.name}
                  </h3>
                  <div
                    className="flex items-center bg-white sm:border-2 
              border-black rounded-md p-2 space-x-3"
                  >
                    <img
                      src={instr.icon}
                      alt="play"
                      className="h-9 sm:hidden lg:block"
                    />
                    <p className="hidden sm:block sm:w-44 lg:w-60">
                      {instr.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {helper !== "" && (
            <div
              className="bg-white border-2 border-black p-2 rounded-md flex sm:hidden
            fade-in"
            >
              <img src={icon} alt="" className="mr-4" />
              <p>{helper}</p>
            </div>
          )}
        </section>
        <section
          className="m-4 space-y-4 sm:space-y-0 gap-4 sm:grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(384px, 1fr))",
          }}
        >
          <article className="p-4 border-2 border-black rounded-md space-y-4 bg-[#EFEFFF]">
            <h2 className="font-header text-2xl">Today</h2>
            <p>Can you figure out the most popular answers?</p>
            <Question image={today.urls.raw} id={342} />
            <div className="flex w-full justify-between">
              <p>15.6k Ballots</p>
              <p>|</p>
              <p>3.1k Voters</p>
              <p>|</p>
              <p>54 Unique answers</p>
            </div>
            <div className="flex w-full justify-between">
              <p>Only 14 hours left to play!</p>
              <a className="underline" href="/">
                More questions
              </a>
            </div>
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-4 bg-[#FFECEC] 
          md:order-first"
          >
            <h2 className="font-header text-2xl">Yesterday</h2>
            <p>Take a look at how you did yesterday's questions!</p>
            <Question image={yesterday.urls.raw} id={341} />
            <Answers id={341} />
            <div className="flex w-full justify-between">
              <a className="underline" href="/">
                See all answers
              </a>
              <a className="underline" href="/">
                Archived questions
              </a>
            </div>
          </article>

          <article className="p-4 border-2 border-black rounded-md space-y-4 bg-[#EBFAEB]">
            <h2 className="font-header text-2xl">Tomorrow</h2>
            <p>Participate in the survey for tomorrow's game!</p>
            <Question image={tomorrow.urls.raw} id={343} />
            <div className="flex w-full justify-between">
              <p>Only 14 hours left to vote!</p>
              <a className="underline" href="/">
                More questions
              </a>
            </div>
          </article>
          <article className="self-end">
            <h2 className="font-header text-2xl mb-2">More</h2>
            <div className="flex space-x-4">
              <button className="shadow px-2 py-1 rounded-sm border-button text-button bg-[#F9F1F0] font-bold border-2">
                Buy Ballot
              </button>
              <button className="shadow px-2 py-1 rounded-sm border-button text-button bg-[#F9F1F0] font-bold border-2">
                Draft a question
              </button>
            </div>
            <p className="my-4">
              Plurality is a{" "}
              <a href="/" className="underline">
                decentralized app
              </a>
              .
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
