import { Link } from "remix";
import { Photo, QuestionSchema } from "~/lib/schemas";

type Props = {
  question: QuestionSchema;
  photo: Photo;
};

export default function Question({ question, photo }: Props) {
  return (
    <Link to={`/questions/${question._id}`}>
      <div
        className="border-2 border-black rounded-lg overflow-clip 
    drop-shadow-block z-20 bg-white floating my-3 max-w-md mx-auto"
      >
        <img
          src={photo.urls.raw}
          alt="question image"
          className="object-cover h-36 w-full z-10 overflow-clip"
        />
        <h2 className="text-lg p-2 font-bold border-t-2 z-30 border-black bg-white">
          #{question._id} {question.text}
        </h2>
      </div>
    </Link>
  );
}
