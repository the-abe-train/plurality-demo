import AnimatedBanner from "~/components/AnimatedBanner";
import InfoMenu from "~/components/InfoMenu";

export default () => {
  return (
    <main className="flex-grow mx-4 md:mx-auto mb-4 max-w-4xl my-4">
      <AnimatedBanner text="What is Plurality?" />
      <div className="flex flex-col md:flex-row-reverse ">
        <section className="space-y-2">
          <p>
            In an increasingly divided world, many of us long to feel closer to
            the thoughts and feelings of the people outside our bubbles.
            Plurality is a response to this desire for community.
          </p>
          <p className="italic">But seriously, what IS Plurality?</p>
          <ul className="list-disc list-inside mx-8">
            <li className="list-outside">
              Plurality is a <b>game</b> that tests how well you know the most
              common opinions on the internet.
            </li>
            <li className="list-outside">
              Plurality is a <b>platform</b> that invites you to share your
              opinions with the rest of the world.
            </li>
            <li className="list-outside">
              Plurality is a <b>decentralized</b> Web3 application that uses
              blockchain technologies to explore the role of Crypto in gaming.
            </li>
          </ul>
          <p>
            Read the instructions to get started, or connect your Crypto wallet
            and dive right in!
          </p>
        </section>
        <InfoMenu page="what-is-plurality" />
      </div>
    </main>
  );
};
