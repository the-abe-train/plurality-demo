import { NFT } from "~/api/schemas";
import openSeaJpeg from "~/images/open_sea_logo.jpg";

type Props = {
  nfts: NFT[];
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
};

export default ({ nfts, token, setToken }: Props) => {
  // const surveyTokens = nfts.filter(nft => nft.traits.)
  return (
    <div className="my-4">
      {/* <form className="my-2">
        <label htmlFor="id" className="space-x-4">
          <span className="mt-4">Survey Number</span>
          <select name="id" className="min-w-[80px]">
            {nfts.map((nft, idx) => (
              <option key={idx} value={idx}>
                {idx}
              </option>
            ))}
          </select>
        </label>
      </form> */}
      <div className="flex flex-wrap space-x-4 items-center justify-items-center">
        {nfts.length > 0 &&
          nfts.map((nft) => {
            const src = nft.image_url || openSeaJpeg;
            return (
              <img
                key={nft.token_id}
                src={src}
                alt={nft.name}
                width={100}
                className="transition-all cursor-pointer"
                onClick={() => setToken(nft.token_id)}
                style={{
                  filter: token === nft.token_id ? "" : "grayscale(100%)",
                }}
              />
            );
          })}
      </div>
      {nfts.length <= 0 && (
        <p>
          You have no Survey Tokens. You can purchase one from{" "}
          <a href="https://opensea.io/PluralityGame" className="underline">
            OpenSea
          </a>
          .
        </p>
      )}
    </div>
  );
};
