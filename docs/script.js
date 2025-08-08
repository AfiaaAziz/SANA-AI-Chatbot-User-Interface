document.addEventListener("DOMContentLoaded", () => {
  const chatbotLogoContainer = document.getElementById(
    "chatbot-logo-container"
  );
  const chatContainer = document.getElementById("chat-container");

  const welcomeScreen = document.getElementById("welcome-screen");
  const chatScreen = document.getElementById("chat-screen");

  const contactBtn = document.getElementById("contact-btn");
  const contactNavBtn = document.getElementById("contact-nav-btn");
  const backBtn = document.getElementById("back-btn");
  const homeBtn = document.getElementById("home-btn");
  const minimizeWelcome = document.getElementById("minimize-welcome");
  const minimizeChat = document.getElementById("minimize-chat");
  const dotsBtn = document.getElementById("dots-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const clearChatBtn = document.getElementById("clear-chat-btn");
  const sendBtn = document.getElementById("send-btn");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const typingIndicator = document.getElementById("typing-indicator");

  let chatHistory = [];
  const endUserId = generateUUID();

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  const openChat = () => {
    chatContainer.classList.add("open");
    chatbotLogoContainer.style.display = "none";
  };

  const closeChat = () => {
    chatContainer.classList.remove("open");
    chatbotLogoContainer.style.display = "flex";
  };

  const showWelcomeScreen = () => {
    welcomeScreen.classList.add("active");
    chatScreen.classList.remove("active");
    homeBtn.classList.add("active");
    contactNavBtn.classList.remove("active");
  };

  const showChatScreen = () => {
    welcomeScreen.classList.remove("active");
    chatScreen.classList.add("active");
    homeBtn.classList.remove("active");
    contactNavBtn.classList.add("active");
    if (chatBox.children.length === 0) {
      initializeChat();
    }
  };

  const initializeChat = () => {
    displayMessage(
      "Sana",
      "Hi there! 👋 I’m Sana, your assistant here at PHC.",
      "bot-message"
    );
  };

  const clearChat = () => {
    chatBox.innerHTML = "";
    chatHistory = [];
    initializeChat();
    dropdownMenu.classList.remove("show");
  };
  chatbotLogoContainer.addEventListener("click", openChat);
  minimizeWelcome.addEventListener("click", closeChat);
  minimizeChat.addEventListener("click", closeChat);

  contactBtn.addEventListener("click", showChatScreen);
  contactNavBtn.addEventListener("click", showChatScreen);

  backBtn.addEventListener("click", showWelcomeScreen);
  homeBtn.addEventListener("click", showWelcomeScreen);

  dotsBtn.addEventListener("click", () => {
    dropdownMenu.classList.toggle("show");
  });

  clearChatBtn.addEventListener("click", clearChat);

  window.addEventListener("click", (event) => {
    if (!event.target.matches("#dots-btn")) {
      if (dropdownMenu.classList.contains("show")) {
        dropdownMenu.classList.remove("show");
      }
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
  });

  function displayMessage(sender, message, className) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", className);

    if (className === "bot-message" || className === "user-message") {
      messageDiv.innerHTML = message;
    } else {
      messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    displayMessage("You", message, "user-message");
    chatHistory.push(`User: ${message}`);
    userInput.value = "";
    typingIndicator.style.display = "flex";

    const botMessageDiv = document.createElement("div");
    botMessageDiv.classList.add("message", "bot-message");
    botMessageDiv.innerHTML = ``;
    chatBox.appendChild(botMessageDiv);

    let botResponseText = "";

    try {
      const response = await fetch("https://sana.emrchains.com/api3/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain; charset=utf-8",
        },
        body: JSON.stringify({
          query: message,
          unique_id: "PHC-ISB-2025",
          end_user_id: endUserId,
          history: chatHistory,
        }),
      });

      if (!response.body) throw new Error("Response body is not readable.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        botResponseText += decoder.decode(value, { stream: true });
        botMessageDiv.innerHTML = botResponseText;
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      chatHistory.push(`Assistant: ${botResponseText}`);
    } catch (error) {
      console.error("Error:", error);
      botMessageDiv.innerHTML =
        "Error: Unable to get a response. Please try again.";
    } finally {
      typingIndicator.style.display = "none";
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
});
