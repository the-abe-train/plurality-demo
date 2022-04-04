import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Answers from "~/components/Answers";
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
import dayjs from "dayjs";
import Question from "~/components/Question";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

type Message =
  | "You win! Keep guessing to improve your score."
  | "You win! No more guesses."
  | "No more guesses."
  | "Great guess!"
  | "Incorrect survey response."
  | "Already guessed."
  | "Please enter a guess."
  | "";

type LoaderData = {
  votes: VoteAggregation[];
  game: GameSchema;
  message: Message;
  gameOver: boolean;
  question: QuestionSchema;
  photo: Photo;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const questionId = Number(params.questionId);

  // Redirect not signed-in users to home page
  if (!userId) {
    return redirect("/user/login");
  }

  // Get data from db and apis
  const question = await questionById(client, questionId);
  invariant(question, "No question found!");
  console.log(question);
  const photo = await fetchPhoto(question.photo);
  invariant(photo, "No photo found!");

  // Redirect to vote if survey close hasn't happened yet
  const surveyClose = question.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/questions/${questionId}/vote`);
  }

  // Get data from db and apis
  const votes = await votesByQuestion(client, questionId);
  const totalVotes = votes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);
  const game = await gameByQuestionUser(client, questionId, userId, totalVotes);
  invariant(game, "Game upsert failed");
  console.log(votes);

  // Set initial message for player
  const gameOver = game.guesses.length >= 6;
  let message: Message = "";
  if (game.win && !gameOver) {
    message = "You win! Keep guessing to improve your score.";
  } else if (game.win && gameOver) {
    message = "You win! No more guesses.";
  } else if (!game.win && gameOver) {
    message = "No more guesses.";
  }

  const data = { votes, game, message, gameOver, question, photo };
  return json<LoaderData>(data);
};

type ActionData = {
  message: Message;
  correctGuess?: VoteAggregation;
  gameOver?: boolean;
  updatedGame?: GameSchema;
};

export const action: ActionFunction = async ({ request, params }) => {
  // Parse form
  const body = await request.formData();
  const guess = body.get("guess");

  // Reject empty form submissions
  if (typeof guess !== "string") {
    const message = "Please enter a guess.";
    return json<ActionData>({ message });
  }

  // Pull in relevant data
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const questionId = Number(params.questionId);
  const game = await gameByQuestionUser(client, questionId, userId);
  invariant(game, "Game upsert failed");
  const trimmedGuess = guess.trim().toLowerCase();

  // Reject already guessed answers
  if (game.guesses) {
    const alreadyGuessed = game.guesses.find((ans) => {
      const text = ans._id;
      return (
        trim(text) === trimmedGuess || parseAnswer(text).includes(trimmedGuess)
      );
    });
    if (alreadyGuessed) {
      const message = "Already guessed.";
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
    const message = "Incorrect survey response.";
    return json<ActionData>({ message });
  }

  // Update game with new guess
  const updatedGame = await addGuess(client, game._id, correctGuess);
  invariant(updatedGame, "Game update failed");

  // Check if user won
  if (updatedGame.win && updatedGame.guesses.length < 6) {
    const message = "You win! Keep guessing to improve your score.";
    return json<ActionData>({ message, correctGuess, gameOver: false });
  }

  // Check if user lost
  if (updatedGame.win && updatedGame.guesses.length >= 6) {
    const message = "You win! No more guesses.";
    return json<ActionData>({ message, correctGuess, gameOver: true });
  }

  // Accept correct guess
  const message = "Great guess!";
  return json<ActionData>({ message, correctGuess, updatedGame });
};

export default function Play() {
  // Data from server
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // Initial states are from loader data
  const [guesses, setGuesses] = useState(loaderData.game.guesses || []);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(loaderData.gameOver);
  const [message, setMessage] = useState<Message>(loaderData.message);
  const [win, setWin] = useState(loaderData.game.win || false);
  const answers = loaderData.votes;

  // Updates from action data
  useEffect(() => {
    if (actionData?.correctGuess) {
      setGuesses([...guesses, actionData.correctGuess]);
      setGuess("");
    }
    setMessage(actionData?.message || message);
    setWin(actionData?.updatedGame?.win || win);
    setGameOver(actionData?.gameOver || gameOver);
  }, [actionData]);

  // Calculated values
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
      <section className="p-4 space-y-2">
        <Question question={loaderData.question} photo={loaderData.photo} />
      </section>
      <section className="p-4 space-y-4">
        {/* <Question question={loaderData.question} photo={loaderData.photo} /> */}
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
        <p>{gameOver}</p>
        <Form className="text-center space-x-2" method="post">
          <input
            className="border-[1px] border-black py-1 px-2 bg-white disabled:bg-gray-300"
            type="text"
            name="guess"
            placeholder="Guess survey responses"
            value={guess}
            disabled={gameOver}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button
            className="px-2 py-1 rounded-sm border-button text-button 
      bg-[#F9F1F0] font-bold border-2 shadow"
            disabled={gameOver}
            type="submit"
          >
            Enter
          </button>
        </Form>
        {message !== "" && <p>{message}</p>}
      </section>
      <section className="flex flex-col space-y-4">
        <div
          className="w-3/4 mx-auto bg-gray-200 rounded-full h-2.5 
        dark:bg-gray-700 relative"
        >
          <motion.div
            className="h-2.5 rounded-full"
            style={{ backgroundColor: win ? "green" : "blue" }}
            initial={{ width: 0 }}
            animate={{ width: `${score * 100}%` }}
            transition={{ duration: 1 }}
          ></motion.div>
          <div
            className="h-full w-1 z-10 bg-black absolute top-0"
            style={{ left: `calc(${THRESHOLD}% - 2px)` }}
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
