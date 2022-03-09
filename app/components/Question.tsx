// import styles from "~/styles/app.css";

type Data = {
  id: string;
};

// const data = {
//   342: "What is the best colour?",
//   341: "Which browser do you use?",
//   343: "Name something you butter up."
// }
const data = [
  { id: 342, text: "What is the best colour?" },
  { id: 341, text: "Which browser do you use?" },
  { id: 343, text: "Name something you butter up." },
];

type Props = {
  image: string;
  id: number;
};

export default function Question({ image, id }: Props) {
  const question = data.find((question) => question.id === id);
  const text = question ? question.text : "";
  return (
    <div className="border-2 rounded-lg shadow">
      <img
        src={image}
        alt="question image"
        className="object-fill rounded-t-lg"
      />
      <h2 className="text-lg p-2">
        #{id} {text}
      </h2>
    </div>
  );
}
