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
    <div className="border-2 border-black rounded-lg overflow-clip drop-shadow-block z-20 bg-white">
      <img
        src={image}
        alt="question image"
        className="object-cover h-36 w-full z-20"
      />
      <h2 className="text-lg p-2 font-bold border-t-2 z-30 border-black">
        #{id} {text}
      </h2>
    </div>
  );
}
