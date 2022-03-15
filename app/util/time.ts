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

export function timeLeft(surveyClose: number) {
  const now = new Date().getTime();
  const MS_PER_HOUR = 3_600_000;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const difference =
    surveyClose > now ? surveyClose - now : MS_PER_DAY + surveyClose - now;
  const hours = difference / MS_PER_HOUR;
  const minutes = (hours % 1) * 60;
  const hoursMinutes = `${Math.floor(hours)}h ${Math.floor(minutes)}m`;
  if (surveyClose > now) {
    return `Survey closes in ${hoursMinutes}!`;
  } else if (surveyClose <= now && difference > 0) {
    return `Only ${hoursMinutes} left to share your score!`;
  } else {
    return "Test your skills on a previous game!";
  }
}

export function dateBySurvey(question: IQuestion) {
  const surveyClose = question.surveyClosed;
  return new Date(surveyClose).toLocaleDateString("en-CA");
}
