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
import Counter from "~/components/Counter";

import logo from "~/images/icons/logo.svg";
import openSea from "~/images/icons/open_sea.svg";

import { QuestionSchema, UserSchema, VoteAggregation } from "~/db/schemas";
import { Photo } from "~/api/schemas";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { client } from "~/db/connect.server";
import { getSession } from "~/sessions";
import { questionBySurveyClose, userById, votesByQuestion } from "~/db/queries";
import { fetchPhoto } from "~/api/unsplash";

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
  const [yesterdayPhoto, todayPhoto, tomorrowPhoto] = data.photos;

  // TODO need to get real "today" data for votes, unique answers, and plurality
  return (
    <div className="bg-primary1 w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <h1
        className="text-4xl text-center font-header font-bold flex items-center 
          w-full justify-center gap-x-2 mt-6 mb-4"
      >
        <img className="inline h-8 object-fill" src={logo} alt="logo" />
        <span>Plurality</span>
      </h1>
      <main
        className="flex-grow mx-auto mb-4
      grid justify-items-start md:grid-cols-hompage"
      >
        <section className="my-2 space-y-3 h-fit block ">
          <h2 className="font-header text-2xl sm:text-left">
            Click today's question to begin!
          </h2>
          <div className="flex flex-col items-center md:flex-row">
            <Question question={today} photo={todayPhoto} />
            <div
              className="flex md:flex-col justify-center space-x-12 my-2
                md:my-4 md:mx-4 md:gap-y-6 md:space-x-0"
            >
              <div className="flex flex-col items-center">
                <Counter value={354} />
                <span>Votes</span>
              </div>
              <div className="flex flex-col items-center">
                <Counter value={93} />
                <span>Answer</span>
              </div>
              <div className="flex flex-col items-center">
                <Counter value={23} percent />
                <span>Plurality</span>
              </div>
            </div>
          </div>
        </section>
        <section className="md:col-start-1 md:row-start-1 mx-auto md:mx-0">
          <Instructions />
        </section>
        <section className="my-2 space-y-3 h-fit">
          <h2 className="font-header text-2xl">Guess for past surveys</h2>
          <Question question={yesterday} photo={yesterdayPhoto} />
        </section>
        <section className="flex md:flex-row flex-col md:space-x-3 w-max">
          <div className="my-2 space-y-3 h-fit">
            <h2 className="font-header text-2xl">Respond to an open survey</h2>
            <Question question={tomorrow} photo={tomorrowPhoto} />
          </div>
          <div className="md:self-end my-2 flex md:flex-col md:space-y-8 justify-around">
            <div className="w-fit space-y-1 flex flex-col">
              <h3 className="font-header text-lg inline">Play more surveys</h3>
              <Link to="/questions">
                <button className="silver px-3 py-2">More surveys</button>
              </Link>
            </div>
            <div className="w-fit space-y-1 flex flex-col">
              <h3 className="font-header text-lg inline">Draft a survey</h3>
              <a href="https://opensea.io">
                <button className="gold px-3 py-2 flex space-x-1 items-center">
                  <span>Buy a Token</span>
                  <img src={openSea} alt="OpenSea" className="inline" />
                </button>
              </a>
              <Link to="/draft">
                <button className="gold px-3 py-2">Submit a draft</button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
