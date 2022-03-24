import { useEffect, useRef, useState } from "react";
import {
  ActionFunction,
  Form,
  useActionData,
  useSubmit,
  useTransition,
} from "remix";
import Question from "~/components/Question";
import questionData from "~/data/questions.json";
import { IQuestion } from "~/lib/question";
import { dateBySurvey } from "~/util/time";
import { fetchPhoto } from "~/util/unsplash";

import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import { closeDb, connectDb, questionCollection } from "~/server/db";
import dayjs from "dayjs";

type Metadata = {
  pageStart: number;
  pageEnd: number;
  total: number;
};

type Data = {
  results: IQuestion[];
  metadata: Metadata;
};

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
}

export const action: ActionFunction = async ({ request }): Promise<Data> => {
  let body = await request.formData();
  let textParam = body.get("text");
  let dateParam = body.get("date");
  let pageParam = body.get("page");

  const textSearch = textParam
    ? new RegExp(String.raw`${textParam}`, "g")
    : /^\S+$/;
  const dateSearchStart = dayjs(String(dateParam)).startOf("day").valueOf();
  const dateSearchEnd = dayjs(String(dateParam)).endOf("day").valueOf();

  // Pull data from database
  await connectDb();
  const cursorQuestions = questionCollection.find({
    $or: [
      // { $nor: [{ text: { $regex: textSearch } }, { text: "" }] },
      { text: { $regex: textSearch } },
      { id: Number(textParam) },
      { surveyClosed: { $gte: dateSearchStart, $lte: dateSearchEnd } },
    ],
  });
  const allQuestions = await cursorQuestions.toArray();
  await closeDb();
  // {text: {$regex: /that/}}

  const perPage = 6;
  const pageStart = pageParam ? (Number(pageParam) - 1) * perPage : 0;
  const pageEnd = pageParam ? Number(pageParam) * perPage : perPage;

  const metadata = {
    total: allQuestions.length,
    pageStart: Math.min(pageStart, allQuestions.length),
    pageEnd: Math.min(pageEnd, allQuestions.length),
  };

  const results = await Promise.all(
    allQuestions
      .slice(pageStart, pageEnd)
      .map(async (question): Promise<IQuestion> => {
        const photo = await fetchPhoto(question);
        return { ...question, photo };
      })
  );
  return { results, metadata };
};

export default function Index() {
  const submit = useSubmit();
  const [page, setPage] = useState(1);
  const formRef = useRef<HTMLFormElement>(null!);
  const transition = useTransition();

  const data = useActionData<Data>();

  useEffect(() => {
    if (data?.metadata) {
      const maxPages = Math.max(Math.ceil(data.metadata.total / 5), 1);
      setPage(Math.min(page || 1, maxPages));
    }
  }, [data]);

  async function turnPage(change: number) {
    const newFormData = new FormData(formRef.current);
    const formPage = Number(newFormData.get("page"));
    let newPage = formPage + change;
    setPage(newPage);
    newFormData.set("page", String(newPage));
    submit(newFormData, {
      method: "post",
      action: "/questions?index",
      replace: true,
    });
  }

  return (
    <div className="container">
      <Form
        method="post"
        className="m-8 flex flex-col space-y-4 max-w-xl mx-auto px-4"
        ref={formRef}
        onSubmit={() => console.log(page)}
      >
        <h2 className="font-header text-2xl">Search</h2>
        <input
          type="text"
          name="text"
          placeholder="Search by keyword or question ID"
          className="border-[1px] border-black px-2"
        />
        <input
          type="date"
          name="date"
          id="date"
          className="border-[1px] border-black flex-grow px-2"
        />
        <div className="flex justify-between border-black ">
          <div className="flex">
            <button
              className="px-2 border-[1px] border-black rounded-full"
              onClick={() => turnPage(-1)}
              type="button"
            >
              -
            </button>
            <label className="flex mx-2">
              Page:{"  "}
              <input
                type="text"
                name="page"
                id="page"
                placeholder="Page"
                className="text-center w-5"
                onChange={(e) => e.target.value}
                value={page}
              />
            </label>
            <button
              className="px-2 border-[1px] border-black rounded-full"
              onClick={() => turnPage(1)}
              type="button"
              disabled={transition.state !== "idle"}
            >
              +
            </button>
          </div>
          <div className="space-x-4">
            <button
              type="reset"
              className="text-red-700"
              onClick={() => setPage(1)}
              disabled={transition.state !== "idle"}
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-sm border-[1px] px-4 border-black"
              disabled={transition.state !== "idle"}
            >
              Search
            </button>
          </div>
        </div>
      </Form>
      <div className="px-4">
        {data?.metadata?.total && (
          <section className="my-4">
            <div className="m-4 flex justify-between">
              <span>
                Showing {data.metadata.pageStart + 1} - {data.metadata.pageEnd}{" "}
                out of {data.metadata.total}
              </span>
            </div>
            <div className="lg:grid lg:grid-cols-3 gap-4">
              {data.results.map((q: IQuestion) => {
                return <Question question={q} key={q.id} />;
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
