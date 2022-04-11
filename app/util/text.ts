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

export function parseAnswer(ans: string) {
  const trimmedAns = trim(ans);
  const splitAns = trimmedAns.split(/[\s,/]/);
  const options = splitAns.filter((a) => {
    const prepositions = ["a", "the", "in"];
    return !prepositions.includes(a);
  });
  return options;
}

export const truncateEthAddress = (address: string) => {
  // Borrowed from truncate-eth-address
  const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
  const match = address.match(truncateRegex);
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};
