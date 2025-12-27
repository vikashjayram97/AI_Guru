require("dotenv").config();

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const ChatSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat = mongoose.model("Chat", ChatSchema);

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/ask", async (req, res) => {
  const question = req.body.question;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are AI Guru, an expert UPSC mentor. Explain concepts clearly, factually, and in simple language. Use UPSC-style explanation.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    res.json({
      answer: chatCompletion.choices[0].message.content,
    });
  } catch (error) {
    console.error("GROQ ERROR 👉", error);

    res.json({
      answer: "AI Guru is facing an issue. Please try again.",
    });
  }
});

await Chat.create({
  question: question,
  answer: chatCompletion.choices[0].message.content,
});

app.get("/chats", async (req, res) => {
  const chats = await Chat.find().sort({ createdAt: -1 });
  res.json(chats);
});

app.listen(5000, () => {
  console.log("AI Guru backend running on http://localhost:5000");
});
