export function statFormat(number: number) {
  if (number >= 1000) {
    const newNum = (number / 1000).toPrecision(3);
    return newNum + "k";
  } else {
    return number.toPrecision(3);
  }
}
