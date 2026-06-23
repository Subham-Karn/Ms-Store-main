import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const sendEmail = async (to, subject, text = "", html = "") => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Ms Store Support <support@msstore.in>",
      to: [to],
      subject: subject,
      text: text || undefined, 
      html: html || undefined,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Resend API transmission failure loop:", error.message);
    throw error;
  }
};

export default sendEmail;