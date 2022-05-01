import dayjs from "dayjs";
import { Link } from "remix";
import { Photo } from "~/api/schemas";
import { QuestionSchema } from "~/db/schemas";

type Props = {
  question: QuestionSchema;
  photo: Photo;
};

// TODO Needs a "community: boolean" prop to determine silver vs. gold

export default function Question({ question, photo }: Props) {
  const surveyClose = dayjs(question.surveyClose);
  const action = surveyClose > dayjs() ? "vote" : "play";
  return (
    <Link to={`/questions/${question._id}/${action}`}>
      <div
        className="border border-outline rounded-lg 
     z-20 w-[358px] mx-auto silver"
      >
        <div className="z-0 h-40 overflow-hidden rounded-t-md bg-black">
          <img
            src={photo.urls.small}
            alt="question image"
            className="object-cover w-full h-full"
          />
        </div>
        <h2
          className="text-lg p-2 font-bold border-t-2 z-30 border-outline
         rounded-b-lg"
        >
          #{question._id} {question.text}
        </h2>
      </div>
    </Link>
  );
}
