import express, { Request, Response, NextFunction } from "express";
import { sendEmail } from "./emailService";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
const xssClean = require("xss-clean");
import hpp from "hpp";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware for security
app.use(helmet());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

app.use(express.json());
app.use(xssClean());
app.use(hpp());

interface SendEmailRequest {
  to: string;
  subject: string;
  name: string;
  text: string;
  imageUrl: string;
  eventLink: string;
}

app.post("/send-email", async (req: any, res: any, next: NextFunction) => {
  const { to, subject, name, text, imageUrl, eventLink } = req.body;

  if (!name || !to || !subject || !text || !imageUrl || !eventLink) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await sendEmail({ name, to, subject, text, imageUrl, eventLink });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    next(error);
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "An unexpected error occurred",
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
