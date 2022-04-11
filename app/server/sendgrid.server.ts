import { FROM_EMAIL, SENDGRID_API_KEY } from "./env";

type Props = {
  emailBody: string;
  emailTo: string;
  subject: string;
};

export async function sendEmail({ emailBody, emailTo, subject }: Props) {
  const body = {
    personalizations: [{ to: [{ email: emailTo }] }],
    from: { email: FROM_EMAIL },
    subject,
    content: [
      {
        type: "text/html",
        value: emailBody,
      },
    ],
  };

  try {
    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (resp.status === 202) {
      const init = {
        status: 200,
        statusText: "Email sent!",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      };
      return new Response(
        JSON.stringify({ message: "Email sent successfully" }),
        init
      );
    }
    const message = "Email not sent";
    return new Response(JSON.stringify({ message }), { status: 500 });
  } catch (e) {
    const message = "Email not sent";
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}
