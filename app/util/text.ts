import { IAnswer } from "~/lib/question";

export function statFormat(number: number) {
  if (number >= 1000) {
    const newNum = (number / 1000).toPrecision(3);
    return newNum + "k";
  } else if (100 <= number && number < 1000) {
    return String(Math.floor(number));
  } else if (0 < number && number < 100) {
    return String(Math.floor(number));
  } else {
    return String(number);
  }
}

export function trim(str: string) {
  return str.trim().toLowerCase();
}

export function trimListText(items: IAnswer[]) {
  return items.map((a) => trim(a.text));
}

export function parseAnswer(ans: string) {
  const trimmedAns = trim(ans);
  const splitAns = trimmedAns.split(/[\s,/]/);
  const options = splitAns.filter((a) => {
    const prepositions = ["a", "the", "in"];
    return !prepositions.includes(a);
  });
  return options;
}
