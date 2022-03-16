import { Link } from "remix";
import { IQuestion } from "~/lib/question";

type Props = {
  question: IQuestion;
};

export default function Question({ question }: Props) {
  return (
    <Link to={`/questions/${question.id}`}>
      <div
        className="border-2 border-black rounded-lg overflow-clip 
    drop-shadow-block z-20 bg-white floating my-3 max-w-md"
      >
        <img
          src={question.photo?.urls.raw}
          alt="question image"
          className="object-cover h-36 w-full z-10 overflow-clip"
        />
        <h2 className="text-lg p-2 font-bold border-t-2 z-30 border-black bg-white">
          #{question.id} {question.text}
        </h2>
      </div>
    </Link>
  );
}
