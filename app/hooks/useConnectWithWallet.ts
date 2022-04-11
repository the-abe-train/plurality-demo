import { useSubmit } from "remix";
import invariant from "tiny-invariant";

export default function useConnectWithWallet() {
  const submit = useSubmit();
  return async function connectWithWallet() {
    const { ethereum } = window;
    let message = "";
    if (!ethereum || !ethereum.isConnected()) {
      message = "Please install Metamask to connect with wallet.";
    }
    try {
      const result = await ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });
      if (result) {
        invariant(result[0], "No accounts found.");
        const newFormData = new FormData();
        newFormData.set("wallet", result[0]);
        submit(newFormData, {
          method: "post",
          action: "/user/signup",
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
