async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value;

  if (message === "") return;

  addMessage(message, "user");
  input.value = "";

  try {
    const response = await fetch("https://ai-guru-lye7.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content`-Type": "application/json",
      },
      body: JSON.stringify({ question: message }),
    });

    const data = await response.json();
    addMessage(data.answer, "ai");
  } catch (error) {
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
