import React from "react";

export default function howToPlay() {
  return (
    <section className="my-4 space-y-4">
      <h1 className="my-4 text-3xl font-header">How to play</h1>
      <article className="space-y-2">
        <h2 className="mt-3 text-2xl font-header">Connecting to Plurality</h2>
        <p>
          The first thing you need to do to interact with Plurality is connect
          via your crypto wallet. Plurality relies on the Metamask wallet
          protocol for authentication. if you already have an Ethereum wallet
          with Metamask, click the “Connect wallet” button in the header to
          log-in. If you don't, you can make one using the Metamask browser
          extension or mobile app.
        </p>
        <p className="italic">
          What can I do now that I'm conected? Play a survey!
        </p>
      </article>
      <article className="space-y-2">
        <h2 className="mt-3 text-2xl font-header">Playing a Survey</h2>
        <p>
          Every day there is a new survey. To play a survey, you must try to
          guess the most common answers to the survey questions. To win the
          game, you must guess what over 80% of respondents voted in that
          survey. You only get a limited number of viable guesses to pass the
          80% threshold. A guess is considered “viable” if at least 1 person on
          the survey said it.
        </p>
        <p>
          If you guess an answer nobody said, don't worry, it doesn't count. The
          danger is in guessing answers that very few people gave because you
          will run out of guesses before you hit the threshold.
        </p>
        <p className="italic">But who are the survey respondents? You are!</p>
      </article>
      <article className="space-y-2">
        <h2 className="mt-3 text-2xl font-header">Voting</h2>
        <p>
          Each survey has a 24 hour window for players to respond. Anyone can
          respond to the respond in this time frame as long as they are
          connected to the platform.
        </p>
        <p className="italic">But who chooses the survey questions? You do!</p>
      </article>
      <article className="space-y-2">
        <h2 className="mt-3 text-2xl font-header">Drafting</h2>
        <p>
          The first part of the Plurality process is the drafting of survey
          questions. In order to draft a question, you must purchase the right
          do so in the form of an NFT. There is one survey per day, and one NFT
          per survey. The right to the daily survey NFT can purchased via
          auction on OpenSea.io.
        </p>
        <p>
          Once you have the right to make the question for a given day, submit
          it here and the Plurality team will review it before it goes live.
          Make sure to submit your question early to give us time to review! If
          no viable question is submitted by the time the survey opens, a
          fallback question will be used.
        </p>
      </article>
    </section>
  );
}
