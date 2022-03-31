import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Answers from "~/components/Answers";
import Question from "~/components/Question";
import Counter from "~/components/Counter";

import { parseAnswer, statFormat, trim } from "~/util/text";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { client } from "~/server/db.server";
import {
  addGuess,
  fetchPhoto,
  gameByQuestionUser,
  questionById,
  votesByQuestion,
} from "~/server/queries";
import {
  GameSchema,
  Photo,
  QuestionSchema,
  VoteAggregation,
} from "~/lib/schemas";
import { getSession } from "~/sessions";

import { MAX_GUESSES, THRESHOLD } from "~/util/gameplay";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

type LoaderData = {
  question: QuestionSchema;
  votes: VoteAggregation[];
  photo: Photo;
  game: GameSchema;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  console.log("User ID", userId);
  const questionId = Number(params.slug);

  // Redirect not signed-in users to home page
  if (!userId) {
    return redirect("/user/login");
  }

  // Get data from db and apis
  const question = await questionById(client, questionId);
  const votes = await votesByQuestion(client, questionId);
  invariant(question, "No question found!");
  const photo = await fetchPhoto(question);
  const game = await gameByQuestionUser(client, questionId, userId);
  invariant(game, "Game upsert failed");
  console.log(game);
  const data = { question, votes, photo, game };
  return json<LoaderData>(data);
};

type ActionData = {
  message: string;
  correctGuess?: VoteAggregation;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Parse form
  const body = await request.formData();
  const guess = body.get("guess");

  // Reject empty form submissions
  if (typeof guess !== "string") {
    const message = "Please enter a guess";
    return json<ActionData>({ message });
  }

  // Pull in relevant data
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("data")?.user;
  const questionId = Number(params.slug);
  const game = await gameByQuestionUser(client, questionId, userId);
  invariant(game, "Game upsert failed");
  const trimmedGuess = guess.trim().toLowerCase();

  // Reject already guessed answers
  if (game.guesses) {
    const userGuesses = game.guesses.map((guess) => guess._id);
    if (userGuesses.includes(guess)) {
      const message = "Already guessed";
      return json<ActionData>({ message });
    }
  }

  // Pull in more relevant data
  const answers = await votesByQuestion(client, questionId);
  console.log("Answers:", answers);
  const correctGuess = answers.find((ans) => {
    const text = ans._id;
    return (
      trim(text) === trimmedGuess || parseAnswer(text).includes(trimmedGuess)
    );
  });

  // Reject incorrect guesses
  if (!correctGuess) {
    const message = "Incorrect guess";
    return json<ActionData>({ message });
  }

  // Update game with new guess
  // TODO add winning to game update. Requires knowing total votes of the question
  const updatedGame = await addGuess(client, game._id, correctGuess);

  // Check if user won
  if (updatedGame?.win) {
    const message = "You win!";
    return json<ActionData>({ message, correctGuess });
  }

  // Accept correct guess
  const message = "";
  invariant(updatedGame, "Game update failed");

  return json<ActionData>({ message, correctGuess });
};

export default function QuestionSlug() {
  // TODO Is all the question data, including answers, visible in the client?
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const [guesses, setGuesses] = useState(loaderData.game.guesses || []);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState(actionData?.message || "");

  useEffect(() => {
    if (actionData?.correctGuess) {
      setGuesses([...guesses, actionData.correctGuess]);
      setGuess("");
    }
  }, [actionData]);

  const answers = loaderData.votes;
  const totalVotes = answers.reduce((sum, vote) => {
    return sum + vote.votes;
  }, 0);
  const remainingGuesses = MAX_GUESSES - guesses.length;
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const score = points / totalVotes;

  return (
    <main className="container space-y-4 my-4 max-w-lg">
      <section className="p-4 space-y-4">
        <Question question={loaderData.question} photo={loaderData.photo} />
        <Answers answers={answers} guesses={guesses} />
        <div
          className="block mx-auto w-44 border-[1px] border-black 
        rounded-sm bg-white p-1"
        >
          <div className="flex items-center">
            <span className="text-sm font-bold w-1/2">Remaining</span>
            <span className="text-sm flex-grow">
              {statFormat((1 - score) * 100)}%
            </span>
            <span>{`${statFormat(totalVotes - points)}B`}</span>
          </div>
        </div>
        <Form className="text-center space-x-2" method="post">
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
          >
            Enter
          </button>
        </Form>
        {message !== "" && <p>{message}</p>}
        <p>{actionData?.message}</p>
      </section>
      <section className="flex flex-col space-y-4">
        <div
          className="w-3/4 mx-auto bg-gray-200 rounded-full h-2.5 
        dark:bg-gray-700 relative"
        >
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${score * 100}%` }}
            transition={{ duration: 1 }}
          ></motion.div>
          <div
            className="h-full w-1 z-10 bg-black absolute top-0"
            style={{ left: `${THRESHOLD}%` }}
          ></div>
        </div>
        <div className="flex justify-center w-full space-x-12">
          <div className="flex flex-col items-center">
            <Counter value={points} />
            <p>Points</p>
          </div>
          <div className="flex flex-col items-center">
            <Counter value={remainingGuesses} />
            <p>Guesses left</p>
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
