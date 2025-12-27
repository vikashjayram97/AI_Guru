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

app.post("/ask", async (req, res) => {
  const question = req.body.question;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are AI Guru, an expert UPSC mentor. Explain concepts clearly in simple language.",
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
