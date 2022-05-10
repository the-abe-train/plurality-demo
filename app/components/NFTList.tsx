import { NFT } from "~/api/schemas";
import openSeaJpeg from "~/images/open_sea_logo.jpg";

export default ({ nfts }: { nfts: NFT[] }) => {
  return (
    <div className="my-4">
      <div className="grid grid-cols-3 items-center justify-items-center">
        {nfts.length > 0 &&
          nfts.map((nft, idx) => {
            if (nft.image_url) {
              return (
                <img key={idx} src={nft.image_url} alt={nft.name} width={100} />
              );
            }
            return (
              <img key={idx} src={openSeaJpeg} alt={nft.name} width={100} />
            );
          })}
      </div>
      {nfts.length <= 0 && (
        <p>
          You have no Draft Tokens. You can purchase one from{" "}
          <a href="https://opensea.io/PluralityGame" className="underline">
            OpenSea
          </a>
          .
        </p>
      )}
    </div>
  );
};
