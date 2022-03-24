import { json, LoaderFunction, useLoaderData } from "remix";
import Footer from "~/components/Footer";
import Header from "~/components/Header";
import Question from "~/components/Question";

import { IQuestion } from "~/lib/question";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { fetchPhoto } from "~/util/unsplash";
import { midnights } from "~/util/time";

import Instructions from "~/components/Instructions";
import Summary from "~/components/Summary";
import {
  closeDb,
  connectDb,
  questionCollection,
  userCollection,
} from "~/server/db";
import { getSession } from "~/sessions";
import { User } from "~/lib/authentication";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

type LoaderData = {
  user: User | null;
  questions: IQuestion[];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Data variables
  const data: LoaderData = {
    user: null,
    questions: [],
  };

  // Connect to db
  await connectDb();

  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  if (userId) {
    data["user"] = await userCollection.findOne({ _id: userId });
  }

  // Get home page questions
  const surveyCloses = midnights();
  const today = await questionCollection.findOne({
    surveyClosed: surveyCloses["today"],
  });
  const yesterday = await questionCollection.findOne({
    surveyClosed: surveyCloses["yesterday"],
  });
  const tomorrow = await questionCollection.findOne({
    surveyClosed: surveyCloses["tomorrow"],
  });

  // Close connection to database
  await closeDb();

  // Get pictures from Unsplash
  // TODO Apply for production from Unsplash
  if (today && tomorrow && yesterday) {
    const questions = await Promise.all(
      [yesterday, today, tomorrow].map(async (question): Promise<IQuestion> => {
        const photo = await fetchPhoto(question);
        return { ...question, photo };
      })
    );
    data["questions"] = questions;
  }
  return json(data);
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const [yesterday, today, tomorrow] = data.questions;

  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect wallet"} />
      <main className="container flex-grow px-4">
        <Instructions />
        <section
          className="space-y-4 sm:space-y-0 gap-4 sm:grid justify-items-center"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(384px, 1fr))",
          }}
        >
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
          bg-[#EFEFFF] max-w-md"
          >
            <h2 className="font-header text-2xl">Today</h2>
            <p className="mb-2">Can you figure out the most popular answers?</p>
            <Question question={today} />
            <Summary question={today} />
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
          bg-[#EBFAEB] max-w-md"
          >
            <h2 className="font-header text-2xl">Tomorrow</h2>
            <p>Participate in the survey for tomorrow's game!</p>
            <Question question={tomorrow} />
            <Summary question={tomorrow} />
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
            bg-[#FFECEC] max-w-md lg:order-first"
          >
            <h2 className="font-header text-2xl">Yesterday</h2>
            <p>Take a look at how you did yesterday's questions!</p>
            <Question question={yesterday} />
            <Summary question={yesterday} />
          </article>
        </section>
        <section className="self-end justify-self-start p-8">
          <h2 className="font-header text-2xl mb-2">More</h2>
          <div className="flex space-x-4">
            <button
              className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
            >
              Buy Ballot
            </button>
            <button
              className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
            >
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
        </section>
      </main>
      <Footer />
    </div>
  );
}
