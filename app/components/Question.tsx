import { Link } from "remix";
import { Photo, QuestionSchema } from "~/lib/schemas";

type Props = {
  question: QuestionSchema;
  photo: Photo;
};

// Should be using overflow instead of rounding the corners of the inside
// divs, but overflow on the main container was causing issues on firefox

export default function Question({ question, photo }: Props) {
  return (
    <Link to={`/questions/${question._id}/play`}>
      <div
        className="border-2 border-black rounded-lg 
    drop-shadow-block z-20 bg-white floating my-3 max-w-md mx-auto"
      >
        <div className="z-0 h-40 overflow-hidden rounded-t-md bg-black">
          <img
            src={photo.urls.raw}
            alt="question image"
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className="text-lg p-2 font-bold border-t-2 z-30 border-black bg-white rounded-b-lg">
          #{question._id} {question.text}
        </h2>
      </div>
    </Link>
  );
}
