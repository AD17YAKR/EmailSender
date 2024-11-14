import nodemailer from "nodemailer";
import mjml from "mjml";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
interface EmailParams {
  name: string;
  to: string;
  subject: string;
  text: string;
  imageUrl: string;
  eventLink: string;
}

export const sendEmail = async ({
  name,
  to,
  subject,
  text,
  imageUrl,
  eventLink,
}: EmailParams) => {
  try {
    const mjmlTemplatePath = path.resolve(
      __dirname,
      "templates",
      "testTemplate.mjml"
    );
    let mjmlContent = fs.readFileSync(mjmlTemplatePath, "utf8");

    mjmlContent = mjmlContent.replace("{{name}}", name);
    mjmlContent = mjmlContent.replace("{{message}}", text);
    mjmlContent = mjmlContent.replace("{{imageUrl}}", imageUrl);
    mjmlContent = mjmlContent.replace("{{eventLink}}", eventLink);

    const { html } = mjml(mjmlContent);
    const transporter = nodemailer.createTransport({
      host: "tempmail.us.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
