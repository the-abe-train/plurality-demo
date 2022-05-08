import { json, LinksFunction, LoaderFunction, useLoaderData } from "remix";
import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import switchStyles from "~/styles/switch.css";
import animations from "~/styles/animations.css";
import { SurveySchema } from "~/db/schemas";
import { surveyByClose } from "~/db/queries";
import { client } from "~/db/connect.server";
import AnimatedBanner from "~/components/AnimatedBanner";
import Survey from "~/components/Survey";
import { Photo } from "~/api/schemas";
import invariant from "tiny-invariant";
import { fetchPhoto } from "~/api/unsplash";

import logo from "~/images/icons/logo.svg";
import guess from "~/images/icons/guess.svg";
import vote from "~/images/icons/respond.svg";
import draft from "~/images/icons/draft.svg";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
    { rel: "stylesheet", href: switchStyles },
  ];
};

type LoaderData = {
  survey: SurveySchema;
  photo: Photo;
};

export const loader: LoaderFunction = async ({ request }) => {
  const midnight = dayjs().tz("America/Toronto").endOf("day");
  const surveyClose = midnight.subtract(1, "day").toDate();
  const survey = await surveyByClose(client, surveyClose);
  invariant(survey, "Tomorrow's survey not found!");
  const photo = await fetchPhoto(survey.photo);
  const data = { survey, photo };
  return json<LoaderData>(data);
};

const instructions = [
  {
    name: "Guess",
    icon: guess,
    text: (
      <>
        <b>Guess</b> the most popular answers to surveys.
      </>
    ),
  },
  {
    name: "Vote",
    icon: vote,
    text: (
      <>
        <b>Respond</b> to survey questions for future games.
      </>
    ),
  },
  {
    name: "Draft",
    icon: draft,
    text: (
      <>
        <b>Draft</b> custom questions for future surveys.
      </>
    ),
  },
];

export default function questions() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="light w-full top-0 bottom-0 flex flex-col min-h-screen">
      <div
        className="md:absolute top-1/2 left-1/2 md:w-max md:mx-4
        md:transform md:-translate-x-1/2 md:-translate-y-1/2
        max-w-survey md:max-w-4xl mx-auto"
      >
        <AnimatedBanner text="Plurality" icon={logo} size={"50"} />
        <p className="text-center text-lg">A Web3 guessing game.</p>
        <div className="md:grid grid-cols-2 gap-y-3 gap-x-8 my-8">
          <h2 className="block text-2xl font-header row-start-1">
            Click on today's Survey to begin!
          </h2>
          <div className="col-start-2">
            <Survey photo={data.photo} survey={data.survey} />
          </div>
          <h2 className="text-2xl font-header row-start-1 mt-6 md:mt-0">
            Instructions
          </h2>
          <div
            className="col-start-1 row-start-2 flex justify-around card 
            flex-col max-w-survey min-w-[260px] p-3 space-y-4 h-full
            "
          >
            {instructions.map((instr) => {
              return (
                <div key={instr.name} className="flex flex-col items-center">
                  <div className="flex items-center p-2 space-x-3">
                    <img
                      src={instr.icon}
                      alt={instr.name}
                      className="h-9 block"
                    />
                    <p className="block text-black">{instr.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
