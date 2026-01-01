async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();

  console.log("Sending message:", message);

  if (!message) {
    alert("Please enter a question");
    return;
  }

  addMessage(message, "user");
  input.value = "";

  try {
    const response = await fetch("https://ai-guru-lye7.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
      }),
    });

    const data = await response.json();
    console.log("Backend response:", data);

    addMessage(data.answer, "ai");
  } catch (error) {
    console.error("Fetch error:", error);
    addMessage("Error connecting to server", "ai");
  }
}

function addMessage(text, sender) {
  const chatBox = document.getElementById("chatBox");
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.innerText = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadChatHistory() {
  try {
    const response = await fetch("https://ai-guru-lye7.onrender.com/chats");
    const chats = await response.json();

    chats.reverse().forEach((chat) => {
      addMessage(chat.question, "user");
      addMessage(chat.answer, "ai");
    });
  } catch (error) {
    console.error("Failed to load chat history");
  }
}

window.onload = loadChatHistory;
