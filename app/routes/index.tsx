import {
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import Footer from "~/components/Footer";
import Header from "~/components/Header";
import Question from "~/components/Question";
import Instructions from "~/components/Instructions";
import Summary from "~/components/Summary";

import {
  Photo,
  QuestionSchema,
  UserSchema,
  VoteAggregation,
} from "~/lib/schemas";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { client } from "~/server/db.server";
import { getSession } from "~/sessions";
import {
  fetchPhoto,
  questionBySurveyClose,
  userById,
  votesByQuestion,
} from "~/server/queries";

dayjs.extend(utc);
dayjs.extend(timezone);

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

type LoaderData = {
  questions: QuestionSchema[];
  photos: Photo[];
  user?: UserSchema;
  votes: VoteAggregation[][];
};

export const loader: LoaderFunction = async ({ request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const user = (await userById(client, userId)) || undefined;

  // Get datetime objects
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const yesterdaySc = midnight.subtract(2, "day").toDate();
  const todaySc = midnight.subtract(1, "day").toDate();
  const tomorrowSc = midnight.toDate();

  // Get questions from db
  const yesterday = await questionBySurveyClose(client, yesterdaySc);
  const today = await questionBySurveyClose(client, todaySc);
  const tomorrow = await questionBySurveyClose(client, tomorrowSc);
  console.log("Today survey close", todaySc);
  invariant(today, "Today's question not fetched from database");

  // Get photo for each question from Unsplash and votes from database
  if (yesterday && today && tomorrow) {
    const questions = [yesterday, today, tomorrow];
    // TODO Apply for production from Unsplash
    const photos = await Promise.all(
      [yesterday, today, tomorrow].map(async (question) => {
        return await fetchPhoto(question.photo);
      })
    );
    const votes = await Promise.all(
      [yesterday, today, tomorrow].map(async (question) => {
        return await votesByQuestion(client, question._id);
      })
    );

    // Return data
    const data = { questions, user, photos, votes };
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
      <Header name={data.user ? data.user.name : "Connect"} />
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
          bg-[#EFEFFF] max-w-md h-fit"
          >
            <h2 className="font-header text-2xl">Today</h2>
            <p className="mb-2">Can you figure out the most popular answers?</p>
            <Question question={today} photo={todayPhoto} />
            <Summary question={today} votes={todayVotes} />
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
          bg-[#EBFAEB] max-w-md h-fit"
          >
            <h2 className="font-header text-2xl">Tomorrow</h2>
            <p>Participate in the survey for tomorrow's game!</p>
            <Question question={tomorrow} photo={tomorrowPhoto} />
            <Summary question={tomorrow} votes={tomorrowVotes} />
          </article>
          <article
            className="p-4 border-2 border-black rounded-md space-y-3 
            bg-[#FFECEC] max-w-md h-fit lg:order-first"
          >
            <h2 className="font-header text-2xl">Yesterday</h2>
            <p>Take a look at how you did yesterday's questions!</p>
            <Question question={yesterday} photo={yesterdayPhoto} />
            <Summary question={yesterday} votes={yesterdayVotes} />
          </article>
        </section>
        <section className="self-end justify-self-start py-8 px-4">
          <h2 className="font-header text-2xl mb-2">More</h2>
          <nav className="flex space-x-4">
            <Link to="/draft">
              <button
                className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
              >
                Draft a question
              </button>
            </Link>
            <a href="https://opensea.io">
              <button
                className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
              >
                Buy a draft token
              </button>
            </a>
          </nav>
        </section>
      </main>
      <Footer />
    </div>
  );
}
