import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("AI Guru backend is running 🚀");
});

app.post("/ask", async (req, res) => {
  console.log("Incoming body:", req.body);

  const question = req.body?.question;

  if (!question) {
    return res.status(400).json({
      answer: "Invalid request. Question not received.",
    });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are AI Guru, a strict UPSC Civil Services mentor.

Rules:
1. Answer only as per UPSC syllabus.
2. Use simple, factual, exam-oriented language.
3. If the question is out of syllabus, clearly say so.
`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.2,
    });

    const answer = chatCompletion.choices[0].message.content;
    res.json({ answer });
  } catch (error) {
    console.error("Groq error:", error);

    res.json({
      answer:
        "AI Guru is currently busy. Please wait a few seconds and try again.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Guru backend running on port ${PORT}`);
});
