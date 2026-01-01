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

import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", chatSchema);

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
You are AI Guru, a supportive mental wellness assistant.

Guidelines:
1. You are NOT a licensed therapist or doctor.
2. You provide emotional support, active listening, and gentle guidance.
3. Use empathetic, calm, and non-judgmental language.
4. Help users reflect on thoughts and emotions.
5. Do NOT give medical, psychiatric, or diagnostic advice.
6. If the user shows signs of self-harm, suicide, or severe distress:
   - Encourage them to seek professional help
   - Suggest reaching out to trusted people or local helplines
7. Avoid absolute claims or guarantees.
8. Keep responses thoughtful, reassuring, and grounded.
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
    await Chat.create({
      question,
      answer,
    });

    res.json({ answer });
  } catch (error) {
    console.error("Groq error:", error);

    res.json({
      answer:
        "AI Guru is currently busy. Please wait a few seconds and try again.",
    });
  }
});

app.get("/chats", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(20);

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch chats" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AI Guru backend running on port ${PORT}`);
});
