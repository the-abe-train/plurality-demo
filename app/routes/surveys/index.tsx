import { useEffect, useRef, useState } from "react";
import {
  ActionFunction,
  Form,
  json,
  LinksFunction,
  useActionData,
  useSubmit,
  useTransition,
} from "remix";
import dayjs from "dayjs";

import Question from "~/components/Question";
import styles from "~/styles/app.css";
import backgrounds from "~/styles/backgrounds.css";
import animations from "~/styles/animations.css";
import { QuestionSchema, VoteAggregation } from "~/db/schemas";
import { questionBySearch, votesByQuestion } from "~/db/queries";
import { client } from "~/db/connect.server";
import { Photo } from "~/api/schemas";
import { fetchPhoto } from "~/api/unsplash";
import { isMobile } from "react-device-detect";

type ActionData = {
  pageQuestions: QuestionSchema[];
  metadata: {
    pageStart: number;
    pageEnd: number;
    total: number;
  };
  photos: Photo[];
  votes: VoteAggregation[][];
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: backgrounds },
    { rel: "stylesheet", href: animations },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  // Parse form
  const body = await request.formData();
  const textParam = body.get("text");
  const dateParam = body.get("date");
  const pageParam = body.get("page");

  // Parse query parameters
  const dateSearch = dayjs(String(dateParam))
    .tz("America/Toronto")
    .endOf("day")
    .toDate();
  const idSearch = Number(textParam);
  const textSearch = textParam
    ? new RegExp(String.raw`${textParam}`, "g")
    : /^\S+$/;
  const perPage = 6;
  const pageStart = pageParam ? (Number(pageParam) - 1) * perPage : 0;
  const pageEnd = pageParam ? Number(pageParam) * perPage : perPage;

  // Questions from database
  const allQuestions = await questionBySearch({
    client,
    textSearch,
    dateSearch,
    idSearch,
  });

  const metadata = {
    total: allQuestions.length,
    pageStart: Math.min(pageStart, allQuestions.length),
    pageEnd: Math.min(pageEnd, allQuestions.length),
  };

  const pageQuestions = allQuestions.slice(pageStart, pageEnd);

  // Get votes from database
  if (pageQuestions) {
    const votes = await Promise.all(
      pageQuestions.map(async (question) => {
        return await votesByQuestion(client, question._id);
      })
    );
    const photos = await Promise.all(
      pageQuestions.map(async (question) => {
        return await fetchPhoto(question.photo);
      })
    );

    // Return data
    const data = { pageQuestions, metadata, photos, votes };
    return json<ActionData>(data);
  }
  return "";
};

// TODO bug: If you search "when" and try to change pages you get weird happenings

export default function Index() {
  const submit = useSubmit();
  const [page, setPage] = useState(1);
  const formRef = useRef<HTMLFormElement>(null!);
  const transition = useTransition();

  const data = useActionData<ActionData>();
  const showData = data?.metadata.total ? data.metadata.total > 0 : false;

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
      action: "/surveys?index",
      replace: true,
    });
  }

  return (
    <main className="flex-grow mx-4 md:mx-auto max-w-6xl">
      <Form
        method="post"
        className="m-8 flex flex-col space-y-4 max-w-xl mx-auto px-4"
        ref={formRef}
      >
        <h1 className="font-header text-2xl text-center">
          Search for a Survey
        </h1>
        <input
          type="text"
          name="text"
          placeholder="Search by keyword or question ID"
          className="border border-black px-2"
        />
        <div
          className="flex-grow flex flex-col justify-between space-y-3
        md:flex-row md:space-y-0"
        >
          <input
            type="date"
            name="date"
            id="date"
            className="border border-black px-2 min-w-[300px]"
          />
          <div>
            <label>
              Community
              <input
                className="mx-2"
                type="checkbox"
                name="community"
                id="community"
                defaultChecked
              />
            </label>
            <label>
              Standard
              <input
                className="mx-2"
                type="checkbox"
                name="standard"
                id="standard"
                defaultChecked
              />
            </label>
          </div>
        </div>
        <div className="flex justify-between border-black ">
          <div className="flex items-center">
            <button
              className="px-2 border border-outline rounded-full bg-white h-min"
              onClick={() => turnPage(-1)}
              type="button"
            >
              -
            </button>
            <label className="flex mx-2 items-center">
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
              className="px-2 border border-outline rounded-full bg-white h-min"
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
              className="cancel px-3 py-2"
              onClick={() => setPage(1)}
              disabled={transition.state !== "idle"}
            >
              Reset
            </button>
            <button
              type="submit"
              className="silver px-3 py-2"
              disabled={transition.state !== "idle"}
            >
              Search
            </button>
          </div>
        </div>
      </Form>
      <div className="md:px-4">
        {showData && data?.metadata && (
          <section className="my-4">
            <div className="m-4 flex justify-between">
              <span>
                Showing {data.metadata.pageStart + 1} - {data.metadata.pageEnd}{" "}
                out of {data.metadata.total}
              </span>
            </div>
            <div
              className="grid md:justify-items-center gap-3"
              style={{
                gridTemplateColumns: isMobile
                  ? "repeat(auto-fit, minmax(auto, 1fr))"
                  : "repeat(auto-fit, minmax(358px, 1fr))",
              }}
            >
              {data.pageQuestions.map((q, idx) => {
                const photo = data.photos[idx];
                return <Question question={q} photo={photo} key={q._id} />;
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}