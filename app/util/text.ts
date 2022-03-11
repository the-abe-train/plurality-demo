import { IAnswer } from "~/lib/question";

export function statFormat(number: number) {
  if (number >= 1000) {
    const newNum = (number / 1000).toPrecision(3);
    return newNum + "k";
  } else if (0 < number && number < 100) {
    return number.toPrecision(2);
  } else {
    return number;
  }
}

export function trim(str: string) {
  return str.trim().toLowerCase();
}

export function trimListText(items: IAnswer[]) {
  return items.map((a) => trim(a.text));
}
