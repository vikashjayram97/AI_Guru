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
  const question = req.body.question;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are AI Guru, a strict UPSC Civil Services mentor.

Rules you must follow:
1. Answer ONLY as per UPSC syllabus.
2. Use simple, factual, exam-oriented language.
3. Structure answers as:
   - Introduction
   - Main Body (with subheadings if needed)
   - Conclusion
4. Avoid casual tone, jokes, emojis.
5. If the question is out of syllabus, clearly say:
   "This question is not relevant to UPSC syllabus."
6. Do NOT hallucinate facts. If unsure, say you are unsure.

Your goal is to help aspirants write better UPSC answers.
`,
        },

        {
          role: "user",
          content: question,
        },
      ],
    });

    const answer = chatCompletion.choices[0].message.content;

    res.json({ answer });
  } catch (error) {
    console.error("Groq error:", error);
    res.json({
      answer: "AI Guru is facing an issue. Please try again.",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Guru backend running on port ${PORT}`);
});
