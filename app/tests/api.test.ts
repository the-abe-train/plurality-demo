import { getNfts } from "~/api/opensea";
import { sendEmail } from "~/api/sendgrid.server";
import { fetchPhoto } from "~/api/unsplash";

declare global {
  var __TEST_WALLET__: string;
  var __ADMIN_EMAIL__: string;
  var __FROM_EMAIL__: string;
}

test("Get Unsplash photo by ID", async () => {
  const testPhotoId = "VWcPlbHglYc";
  const photo = await fetchPhoto(testPhotoId);
  expect(photo.urls.small).toBeDefined();
});

test("OpenSea API reveals NFTs", async () => {
  const nfts = await getNfts(__TEST_WALLET__);
  const names = nfts.map((nft) => nft.name);
  expect(names.includes("The Orchard")).toBeTruthy();
});

test("Send me an email", async () => {
  const response = await sendEmail({
    emailBody: "Test email",
    emailTo: __ADMIN_EMAIL__,
    subject: "Test email",
  });
  const data = await response.json();
  expect(data.message).toBe("Email sent successfully");
});
