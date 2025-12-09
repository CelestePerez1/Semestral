const OPENAI_API_KEY = window.ENV?.OPENAI_API_KEY || "";

if (!OPENAI_API_KEY) {
    console.error("⚠️ ERROR: Falta la variable de entorno OPENAI_API_KEY");
}

const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const CloseChatbot = document.querySelector("#close-chatbot");

const API_URL = "https://api.openai.com/v1/chat/completions";

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Scroll al final
const scrollToLatestMessage = () => {
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
};

// Crear mensaje
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// ===============================
// 🤖 RESPUESTA DEL BOT
// ===============================
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    chatHistory.push({
        role: "user",
        content: userData.message
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: chatHistory,
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error.message);

        const botText = data.choices[0].message.content;

        messageElement.innerText = botText;

        chatHistory.push({
            role: "assistant",
            content: botText
        });

    } catch (error) {
        messageElement.innerText = "❌ Error: " + error.message;
        messageElement.style.color = "red";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        scrollToLatestMessage();
    }
};

// ===============================
// 📤 Enviar mensaje
// ===============================
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    if (!userData.message) return;

    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    const messageContent = `
        <div class="message-text"></div>
        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}
    `;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);

    scrollToLatestMessage();

    setTimeout(() => {
        const incomingContent = `
            <svg class="bot-avatar" width="40" height="40">
                <circle cx="20" cy="20" r="20" fill="#5aa9ff"/>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(incomingContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);

        scrollToLatestMessage();
        generateBotResponse(incomingMessageDiv);
    }, 500);
};

// Enter para enviar
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey) {
        handleOutgoingMessage(e);
    }
});

// Ajuste altura
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
});

// Archivos
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");

        const base64String = e.target.result.split(",")[1];

        userData.file = {
            data: base64String,
            mime_type: file.type
        };

        fileInput.value = "";
    };

    reader.readAsDataURL(file);
});

fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});

// Abrir/cerrar chatbot
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
CloseChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

// Botón enviar
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
