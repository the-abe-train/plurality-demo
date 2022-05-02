import dayjs from "dayjs";
import { useState } from "react";
import { isFirefox, isMobile } from "react-device-detect";

type Props = {
  score: number;
};

export default function ShareButton({ score }: Props) {
  // Sharing your score
  const [msg, setMsg] = useState("");
  async function shareScore() {
    let shareString = `${dayjs()}
Score: ${score}
`;

    if ("canShare" in navigator && isMobile && !isFirefox) {
      return await navigator.share({
        title: "Plurality Stats",
        text: shareString,
      });
    } else {
      setMsg("Copied to clipboard!");
      setTimeout(() => setMsg(""), 2000);
      if ("clipboard" in navigator) {
        return await navigator.clipboard.writeText(shareString);
      } else {
        return document.execCommand("copy", true, shareString);
      }
    }
  }
  return (
    <div className="relative">
      <button className="silver px-3 py-1" onClick={shareScore}>
        Share results
      </button>
      {msg && <span className="absolute top-full left-0 w-40 mt-2">{msg}</span>}
    </div>
  );
}
