// Secret key variable placeholder managed safely at runtime
let GEMINI_API_KEY = "";

// Prompts for the API key safely when the web page is opened on your computer
window.onload = function() {
  GEMINI_API_KEY = prompt("Please enter your Gemini API Key to start chatting:");
  
  if (!GEMINI_API_KEY) {
    alert("Without an API key, the chatbot won't be able to connect to the AI brain. Please refresh and enter a valid key.");
  }
};

function checkEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

async function sendMessage() {
  const inputEl = document.getElementById("user-input");
  const userText = inputEl.value.trim();
  
  if (!userText) return;
  if (!GEMINI_API_KEY) {
    alert("Please refresh the page and input your API key first.");
    return;
  }

  // 1. Output user message
  appendMessage(userText, "user-msg");
  inputEl.value = "";

  // 2. Put loading animation indicator
  const chatScreen = document.getElementById("chat-screen");
  const loader = document.createElement("div");
  loader.className = "message bot-msg typing-bubble";
  loader.id = "ai-loader";
  loader.innerHTML = "<span></span><span></span><span></span>";
  chatScreen.appendChild(loader);
  chatScreen.scrollTop = chatScreen.scrollHeight;

  try {
    // 3. Connect to the live server model endpoints
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: userText }]
        }]
      })
    });

    const data = await response.json();
    
    // Remove the animated loader bubble
    document.getElementById("ai-loader").remove();

    // 4. Print clean structured layout results
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      appendMessage(aiReply, "bot-msg");
    } else {
      appendMessage("I received an empty response. Please double check your request.", "bot-msg");
    }

  } catch (error) {
    if (document.getElementById("ai-loader")) {
      document.getElementById("ai-loader").remove();
    }
    appendMessage("Error reaching the AI brain. Please check your internet connection or make sure your API key is active.", "bot-msg");
    console.error("API Error Log Trace:", error);
  }
}

function appendMessage(text, className) {
  const chatScreen = document.getElementById("chat-screen");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  
  if (className === "bot-msg") {
    // Automatically turn Markdown formatting like **bold** and lists into real HTML
    let formattedText = text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
    
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }
    
    msgDiv.innerHTML = formattedText;
  } else {
    msgDiv.textContent = text;
  }
  
  chatScreen.appendChild(msgDiv);
  chatScreen.scrollTop = chatScreen.scrollHeight; // Keeps page scrolled down
}
