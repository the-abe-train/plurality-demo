export default function terminology() {
  return (
    <section className="space-y-2">
      <h1 className="mb-4 text-3xl font-header">Terminology</h1>
      <article className="space-y-2">
        <h2 className="mt-3 text-2xl font-header">The Shiny Colours</h2>
        <p>
          Every element on Plurality that you can interact with has a shiny,
          metallic gradient.
        </p>
        <p>
          <b className="gold-text">Gold</b> indicates that it's related to Web3,
          including community drafted questions, signing in with your Ethereum
          wallet, or buying an NFT.
        </p>
        <p>
          <b className="silver-text">Silver</b> indicates everything else.
        </p>
      </article>
      <article>
        <h2 className="mt-3 mb-2 text-2xl font-header">Gameplay</h2>
        <table className="table-auto">
          <colgroup>
            <col className="border" />
            <col className="border" />
          </colgroup>
          <tbody>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Survey</td>
              <td className="px-2 py-2">
                A Survey is a question and its accompanying responses.
              </td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Response</td>
              <td className="px-2 py-2">
                A player's answer to a Survey that other players will try to
                guess as part of gameplay.
              </td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Guessing</td>
              <td className="px-2 py-2">
                Playing a Survey is trying to guess the most common answers.
              </td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Drafting</td>
              <td className="px-2 py-2">
                The process of creating a custom Survey question. Can only be
                done by users that are holding Survey Tokens.
              </td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Survey Token</td>
              <td className="px-2 py-2">
                The NFT that represents the opportunity to choose a Survey
                question for a particular day.
              </td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Community</td>
              <td className="px-2 py-2">
                Surveys that were chosen by players via Drafting.
              </td>
            </tr>
            <tr className="border">
              <td className="px-2 py-2 font-bold">Standard</td>
              <td className="px-2 py-2">
                Surveys chosen by the Plurality team.
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  );
}
