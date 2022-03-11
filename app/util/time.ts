import { IQuestion } from "~/lib/question";

export function relativeSurvey(question: IQuestion, date?: Date) {
  // Find the survey relative to today's date
  const { surveyClosed } = question;
  const today = new Date().getTime();
  const day = date?.getTime() || today;
  const MS_PER_DAY = 86_400_000;
  const rd = Math.ceil((surveyClosed - day) / MS_PER_DAY) - 1;
  return rd;
}

export function timeLeft(ms: number) {
  const MS_PER_HOUR = 3_600_000;
  const hours = ms / MS_PER_HOUR;
  const minutes = (hours % 1) * 60;
  return `${Math.floor(hours)}h ${Math.floor(minutes)}m`;
}
