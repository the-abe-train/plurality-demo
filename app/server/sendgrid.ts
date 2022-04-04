import { FROM_EMAIL, SENDGRID_API_KEY, TO_EMAIL } from "./env";

type Props = {
  email: string;
  user: string;
  question: string;
  id: string;
  photo: string;
};

export async function sendEmail({ email, user, question, id, photo }: Props) {
  const output = `
  <h3>Contact Details</h3>
  <ul>
    <li>User ID: ${user}</li>
    <li>Email: ${email}</li>
  </ul>
  <h3>Question id</h3>
  <p>${id}</p>
  <h3>Question text</h3>
  <p>${question}</p>
  <h3>Unsplash photo</h3>
  <p>https://unsplash.com/photos/${photo}</p>
  `;

  const body = {
    personalizations: [{ to: [{ email: TO_EMAIL }] }],
    from: { email: FROM_EMAIL },
    subject: "Plurality Question Submission",
    content: [
      {
        type: "text/html",
        value: output,
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
