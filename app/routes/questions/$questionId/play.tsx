import {
  ActionFunction,
  Form,
  json,
  Link,
  LinksFunction,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import invariant from "tiny-invariant";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";

import { parseAnswer, trim } from "~/util/text";
import { client } from "~/db/connect.server";
import {
  addGuess,
  gameByQuestionUser,
  questionById,
  votesByQuestion,
} from "~/db/queries";
import { GameSchema, QuestionSchema, VoteAggregation } from "~/db/schemas";
import { Photo } from "~/api/schemas";
import { commitSession, getSession } from "~/sessions";
import { fetchPhoto } from "~/api/unsplash";

import Answers from "~/components/Answers";
import Question from "~/components/Question";
import Scorebar from "~/components/Scorebar";
import ShareButton from "~/components/ShareButton";

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
  game: GameSchema;
  message: Message;
  gameOver: boolean;
  question: QuestionSchema;
  photo: Photo;
  totalVotes: number;
};

export const loader: LoaderFunction = async ({ params, request }) => {
  // Get user info
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");
  const questionId = Number(params.questionId);

  // Redirect not signed-in users to home page
  if (!userId) {
    // User can play exactly one game if they're not signed in.
    // Check if the player already has a game in the session
    if (session.has("game") && session.get("game") !== questionId) {
      session.flash(
        "message",
        `You need to be logged-in to play more games.
        (You have already played Question ${session.get("game")})`
      );
      return redirect("/user/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Set the sample game for this not-logged-in user
    session.set("game", questionId);

    // Send user to sample page
    return redirect(`/questions/${questionId}/sample`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // Get question from db
  const question = await questionById(client, questionId);
  invariant(question, "No question found!");

  // Redirect to vote if survey close hasn't happened yet
  const surveyClose = question.surveyClose;
  if (dayjs(surveyClose) >= dayjs()) {
    return redirect(`/questions/${questionId}/vote`);
  }

  // Get additional questiondata from db and apis
  const photo = await fetchPhoto(question.photo);
  invariant(photo, "No photo found!");
  const votes = await votesByQuestion(client, questionId);
  console.log("votes", votes);
  const totalVotes = votes.reduce((sum, ans) => {
    return sum + ans.votes;
  }, 0);
  const game = await gameByQuestionUser({
    client,
    questionId,
    userId,
    totalVotes,
  });
  invariant(game, "Game upsert failed");

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

  const data = { totalVotes, game, message, gameOver, question, photo };
  return json<LoaderData>(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

type ActionData = {
  message: Message;
  correctGuess?: VoteAggregation;
  gameOver?: boolean;
  win?: boolean;
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
  const game = await gameByQuestionUser({ client, questionId, userId });
  invariant(game, "Game upsert failed");
  const trimmedGuess = guess.trim().toLowerCase();

  // Reject already guessed answers
  if (game.guesses) {
    console.log("game with guesses", game);
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
  const { win } = updatedGame;

  // Check if user won and can keep guessing
  if (updatedGame.win && updatedGame.guesses.length < 6) {
    const message = "You win! Keep guessing to improve your score.";
    return json<ActionData>({ message, correctGuess, win, gameOver: false });
  }

  // Check if user won but cannot guess anymore
  if (updatedGame.win && updatedGame.guesses.length >= 6) {
    const message = "You win! No more guesses.";
    return json<ActionData>({ message, correctGuess, win, gameOver: true });
  }

  // Check if user did not win and ran out of guesses
  if (!updatedGame.win && updatedGame.guesses.length >= 6) {
    const message = "No more guesses.";
    return json<ActionData>({ message, correctGuess, gameOver: true });
  }

  // Accept correct guess
  const message = "Great guess!";
  return json<ActionData>({ message, correctGuess, win });
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
  const { totalVotes } = loaderData;

  // Updates from action data
  useEffect(() => {
    if (actionData?.correctGuess) {
      setGuesses([...guesses, actionData.correctGuess]);
      setGuess("");
    }
    setMessage(actionData?.message || message);
    setWin(actionData?.win || win);
    setGameOver(actionData?.gameOver || gameOver);
  }, [actionData]);

  // Calculated values
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const score = points / totalVotes;

  return (
    <main className="container space-y-4 my-4 max-w-lg">
      <Question question={loaderData.question} photo={loaderData.photo} />
      <Answers totalVotes={totalVotes} guesses={guesses} score={score} />
      <section className="px-4 space-y-4">
        <p>{gameOver}</p>
        <Form className="text-center space-x-2" method="post">
          <input
            className="border-[1px] border-black py-1 px-2 bg-white 
            disabled:bg-gray-300"
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
      <Scorebar points={points} score={score} guesses={guesses} win={win} />
      <section className="px-4 space-y-4 pt-6 pb-16">
        <p>Survey closed on 26 February 2022</p>
        <div className="flex items-center space-x-2">
          <ShareButton score={score} />
          <Link to="/questions">
            <button
              className="shadow px-2 py-1 rounded-sm border-button 
            text-button bg-[#F9F1F0] font-bold border-2"
            >
              More questions
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
