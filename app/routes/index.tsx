import { json, LoaderFunction, useLoaderData } from "remix";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import Question from "~/components/Question";
import Instructions from "~/components/Instructions";
import Summary from "~/components/Summary";

import { IQuestion } from "~/lib/question";
import { User } from "~/lib/authentication";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

// import { fetchPhoto } from "~/util/unsplash";
import { midnights } from "~/util/time";
import dayjs from "dayjs";

import {
  closeDb,
  connectDb,
  questionCollection,
  userCollection,
} from "~/server/db";
import { getSession } from "~/sessions";
import {
  fetchPhoto,
  questionBySurveyClose,
  votesByQuestion,
} from "~/server/queries";
import {
  Photo,
  QuestionSchema,
  VoteAggregation,
  VoteSchema,
} from "~/lib/schemas";
import { WithId } from "mongodb";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

// type LoaderData = {
//   user: User | null;
//   questions: IQuestion[];
// };

type QuestionPhoto = {
  photo: Photo;
  votes: VoteAggregation[];
  text: string;
  surveyClose: Date;
  drafted: Date;
  _id: number;
};

type LoaderData = {
  questions: QuestionSchema[];
  photos: Photo[];
  user?: User;
  votes: VoteAggregation[][];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Connect to db
  await connectDb();

  // // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  const user = (await userCollection.findOne({ _id: userId })) || undefined;

  // Get datetime objects
  const midnight = dayjs().endOf("day");
  const todaySc = midnight.toDate();
  const yesterdaySc = midnight.subtract(1, "day").toDate();
  const tomorrowSc = midnight.add(1, "day").toDate();

  // Get questions from db
  const today = await questionBySurveyClose(todaySc);
  const yesterday = await questionBySurveyClose(yesterdaySc);
  const tomorrow = await questionBySurveyClose(tomorrowSc);

  // Get photo for each question from Unsplash and votes from database
  if (today && yesterday && tomorrow) {
    const questions = [today, yesterday, tomorrow];
    // TODO Apply for production from Unsplash
    const photos = await Promise.all(
      [yesterday, today, tomorrow].map(async (question) => {
        return await fetchPhoto(question);
      })
    );
    const votes = await Promise.all(
      [yesterday, today, tomorrow].map(async (question) => {
        return await votesByQuestion(question);
      })
    );

    const data = { questions, user, photos, votes };

    // Close connection to database
    await closeDb();

    return json<LoaderData>(data);
  }
  return "";
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const [yesterday, today, tomorrow] = data.questions;
  const [yesterdayVotes, todayVotes, tomorrowVotes] = data.votes;
  const [yesterdayPhoto, todayPhoto, tomorrowPhoto] = data.photos;

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
            <Question question={today} photo={todayPhoto} />
            <Summary question={today} votes={todayVotes} />
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
          bg-[#EBFAEB] max-w-md"
          >
            <h2 className="font-header text-2xl">Tomorrow</h2>
            <p>Participate in the survey for tomorrow's game!</p>
            <Question question={tomorrow} photo={tomorrowPhoto} />
            <Summary question={tomorrow} votes={tomorrowVotes} />
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
            bg-[#FFECEC] max-w-md lg:order-first"
          >
            <h2 className="font-header text-2xl">Yesterday</h2>
            <p>Take a look at how you did yesterday's questions!</p>
            <Question question={yesterday} photo={yesterdayPhoto} />
            <Summary question={yesterday} votes={yesterdayVotes} />
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
