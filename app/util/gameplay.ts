import { VoteAggregation } from "~/db/schemas";

export const THRESHOLD = 80; // This is a %
export const MAX_GUESSES = 6;

export function checkWin(guesses: VoteAggregation[], totalVotes: number) {
  const points = guesses.reduce((sum, guess) => {
    return sum + guess.votes;
  }, 0);
  const absThreshold = totalVotes * (THRESHOLD / 100);
  return points >= absThreshold;
}
