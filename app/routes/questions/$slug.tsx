import { Form, LoaderFunction, useLoaderData } from "remix";
import Answers from "~/components/Answers";
import Question from "~/components/Question";
import questionData from "~/data/questions.json";
import { IAnswer, IQuestion } from "~/lib/question";
import { parseAnswer, statFormat, trim, trimListText } from "~/util/text";
import { fetchPhoto } from "~/util/unsplash";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { useState } from "react";
import { sumToken } from "~/util/math";

import { motion } from "framer-motion";
import Counter from "~/components/Counter";
import { closeDb, connectDb, questions } from "~/util/db";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

export const loader: LoaderFunction = async ({
  params,
}): Promise<IQuestion> => {
  await connectDb();

  const question = await questions.findOne({
    id: Number(params.slug),
  });

  await closeDb();

  // const question = questionData.find((q) => String(q.id) === params.slug);
  if (!question) throw new Error();
  const photo = await fetchPhoto(question);
  const data = { ...question, photo };
  return data;
};

export default function QuestionSlug() {
  // TODO Is all the question data, including answers, visible in the source?
  const question = useLoaderData<IQuestion>();
  const { answers } = question;

  const [guess, setGuess] = useState("");
  const [correctGuesses, setCorrectGuesses] = useState<IAnswer[]>([]);

  const points = sumToken(correctGuesses);
  const total = sumToken(answers);
  const score = points / total;

  const [message, setMessage] = useState("");

  function formValidate(e: any) {
    e.preventDefault();
    const trimmedGuess = guess.trim().toLowerCase();
    const correctGuess = answers.find(
      ({ text }) =>
        trim(text) === trimmedGuess || parseAnswer(text).includes(trimmedGuess)
    );
    if (correctGuess) {
      if (correctGuesses.includes(correctGuess)) {
        setMessage("Already guessed.");
      } else {
        setMessage("");
        setCorrectGuesses([...correctGuesses, correctGuess]);
        setGuess("");
      }
    } else {
      setMessage("Invalid guess");
    }
  }

  return (
    <main className="container space-y-4 my-4 max-w-lg">
      <section className="p-4 space-y-4">
        <Question question={question} />
        <Answers question={question} guesses={correctGuesses} />
        <div className="block mx-auto w-44 border-[1px] border-black rounded-sm bg-white p-1">
          <div className="flex items-center">
            <span className="text-sm font-bold w-1/2">Remaining</span>
            <span className="text-sm flex-grow">
              {statFormat((1 - score) * 100)}%
            </span>
            <span>{`${statFormat(total - points)}B`}</span>
          </div>
        </div>
        <Form className="text-center space-x-2" action="" method="post">
          <input
            className="border-[1px] border-black py-1 px-2"
            type="text"
            name="guess"
            placeholder="Guess survey responses"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button
            className="px-2 py-1 rounded-sm border-button text-button 
      bg-[#F9F1F0] font-bold border-2 shadow"
            onClick={(e) => formValidate(e)}
          >
            Enter
          </button>
        </Form>
        {message !== "" && <p>{message}</p>}
      </section>
      <section className="flex flex-col space-y-4">
        <div className="w-3/4 mx-auto bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            // style={{ width: `${score * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${score * 100}%` }}
            transition={{ duration: 1 }}
          ></motion.div>
          <div className="h-full w-1 z-10 bg-black absolute right-[5%] top-0"></div>
        </div>
        <div className="flex justify-center w-full space-x-12">
          <div className="flex flex-col items-center">
            <Counter value={points} />
            <p>Points</p>
          </div>
          <div className="flex flex-col items-center">
            <Counter value={total} />
            <p>Votes</p>
          </div>
          <div className="flex flex-col items-center">
            <Counter value={score * 100} percent />
            <p>Score</p>
          </div>
        </div>
      </section>
      <section className="px-4 space-y-4 mt-8">
        <p>Survey closed on 26 February 2022</p>
        <button className="shadow px-2 py-1 rounded-sm border-button text-button bg-[#F9F1F0] font-bold border-2">
          Share results
        </button>
      </section>
    </main>
  );
}
