import { IAnswer, IQuestion } from "~/lib/question";

export function sumToken(answers: IAnswer[]) {
  return answers.reduce((sum, a) => sum + a.token, 0);
}

export function countAnswers(question: IQuestion) {
  return question.answers.length;
}
