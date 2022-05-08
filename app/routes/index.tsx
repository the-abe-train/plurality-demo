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
import Survey from "~/components/Survey";
import Instructions from "~/components/Instructions";
import Counter from "~/components/Counter";

import logo from "~/images/icons/logo.svg";
import openSea from "~/images/icons/open_sea.svg";

import { SurveySchema, UserSchema, VoteAggregation } from "~/db/schemas";
import { Photo } from "~/api/schemas";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { client } from "~/db/connect.server";
import { getSession } from "~/sessions";
import { surveyByClose, userById, votesBySurvey } from "~/db/queries";
import { fetchPhoto } from "~/api/unsplash";
import AnimatedBanner from "~/components/AnimatedBanner";

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
  questions: SurveySchema[];
  photos: Photo[];
  user?: UserSchema;
  todayVotes: VoteAggregation[];
};

// TODO all loader and action functions should get all their data with Promise.all

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
  const yesterday = await surveyByClose(client, yesterdaySc);
  const today = await surveyByClose(client, todaySc);
  const tomorrow = await surveyByClose(client, tomorrowSc);
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
    const todayVotes = await votesBySurvey(client, today._id);

    // Return data
    const data = { questions, user, photos, todayVotes };
    return json<LoaderData>(data);
  }
  return "";
};

// TODO decide on how to use "secondary" colour for text. Needs to be consistent.
// TODO maybe hide today's survey stats on mobile? Looks crowded.

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const [yesterday, today, tomorrow] = data.questions;
  const [yesterdayPhoto, todayPhoto, tomorrowPhoto] = data.photos;

  const { todayVotes } = data;
  const todayResponses = todayVotes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);
  const todayUniqueAnswers = todayVotes.length;
  const todayPlurality = (todayVotes[0].votes / todayResponses) * 100;

  return (
    <div className="bg-primary1 w-full top-0 bottom-0 flex flex-col min-h-screen">
      <Header name={data.user ? data.user.name : "Connect"} />
      <AnimatedBanner icon={logo} text="Plurality" />
      <div className="flex-grow">
        <main
          className=" mx-auto mb-4 w-max md:gap-y-3 md:gap-x-6
      grid justify-items-start md:grid-cols-hompage h-max"
        >
          <section className="h-fit block ">
            <h2 className="font-header mb-2 text-2xl sm:text-left">
              Play today's Survey!
            </h2>
            <div className="flex flex-col items-center md:flex-row">
              <Survey survey={today} photo={todayPhoto} />
            </div>
          </section>
          <div
            className="flex md:flex-col justify-center md:justify-start space-x-12 my-2
                md:mt-10 md:mx-4 md:gap-y-6 md:space-x-0 w-full md:w-max h-max"
          >
            <div className="flex flex-col items-center">
              <Counter value={todayResponses} />
              <span>Responses</span>
            </div>
            <div className="flex flex-col items-center">
              <Counter value={todayUniqueAnswers} />
              <span>Answer</span>
            </div>
            <div className="flex flex-col items-center">
              <Counter value={todayPlurality} percent />
              <span>Plurality</span>
            </div>
          </div>
          <section className="md:col-start-1 md:row-start-1 mx-auto md:mx-0 h-max">
            <Instructions />
          </section>
          <section className="my-2 space-y-3 h-fit">
            <h2 className="font-header mb-2 text-2xl sm:text-left">
              Play previous Surveys
            </h2>
            <Survey survey={yesterday} photo={yesterdayPhoto} />
          </section>
          <section className="flex md:flex-row flex-col md:space-x-3 w-max">
            <div className="my-2 space-y-3 h-fit">
              <h2 className="font-header mb-2 text-2xl sm:text-left">
                Respond to an open Survey
              </h2>
              <Survey survey={tomorrow} photo={tomorrowPhoto} />
            </div>
          </section>
          <div className="md:self-end my-2 flex md:flex-col md:space-y-8 justify-around w-full md:w-max">
            <div className="w-max space-y-2 flex flex-col">
              <h3 className="font-header text-lg inline">Play more surveys</h3>
              <Link to="/surveys">
                <button className="silver px-3 py-2">More surveys</button>
              </Link>
            </div>
            <div className="w-max space-y-2 flex flex-col">
              <h3 className="font-header text-lg inline">Draft a survey</h3>
              <a href="https://opensea.io/PluralityGame">
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
        </main>
      </div>
      <Footer />
    </div>
  );
}
