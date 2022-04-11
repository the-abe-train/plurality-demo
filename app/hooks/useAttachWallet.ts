import { useSubmit } from "remix";
import invariant from "tiny-invariant";

export default function useAttachWallet() {
  const submit = useSubmit();
  return async function attachWallet() {
    const { ethereum } = window;
    let message = "";
    if (!ethereum || !ethereum.isConnected()) {
      message = "Please install Metamask to attach wallet.";
    }
    try {
      const result = await ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });
      if (result) {
        invariant(result[0], "No accounts found.");
        const wallet = result[0];
        const newFormData = new FormData();
        newFormData.set("wallet", wallet);
        newFormData.set("_action", "attachWallet");
        submit(newFormData, {
          method: "post",
          action: "/user?index",
          replace: true,
        });
      }
    } catch (e) {
      message = "Error connecting to MetaMask";
      console.error(e);
    }
    return message;
  };
}
