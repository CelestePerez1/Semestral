const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const CloseChatbot = document.querySelector("#close-chatbot");

// =========================
// 🔐 API DE OPENAI
// =========================
const API_KEY = "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"; // <---- coloca tu API KEY aquí
const API_URL = `https://api.openai.com/v1/chat/completions`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Scroll abajo
const scrollToLatestMessage = () => { 
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth"});
};

// Crear burbuja
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// ===============================
// 🤖 Obtener respuesta del BOT
// ===============================
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Guardar mensaje del usuario en historial
    chatHistory.push({
        role: "user",
        content: userData.message
    });

    // PREPARAR BODY para OpenAI
    const requestBody = {
        model: "gpt-4o-mini", // cambia a gpt-4o o gpt-4.1 si deseas
        messages: chatHistory,
        temperature: 0.7
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error.message);

        const botText = data.choices[0].message.content;

        messageElement.innerText = botText;

        // Guardar en historial
        chatHistory.push({
            role: "assistant",
            content: botText
        });

    } catch (error) {
        console.error(error);
        messageElement.innerText = "❌ Error: " + error.message;
        messageElement.style.color = "red";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        scrollToLatestMessage();
    }
};

// ===============================
// 📤 Enviar mensaje del usuario
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
        const messageContent = `
            <svg class="bot-avatar" width="40" height="40">
                <circle cx="20" cy="20" r="20" fill="#5aa9ff"/>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div><div class="dot"></div><div class="dot"></div>
                </div>
            </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);

        scrollToLatestMessage();
        generateBotResponse(incomingMessageDiv);
    }, 500);
};

// ENVIAR con Enter
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage && !e.shiftKey){
        handleOutgoingMessage(e);
    }
});

// ADAPTAR altura del input
messageInput.addEventListener("input",() => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
});

// Cargar archivo
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;
    
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

// Cancelar archivo
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});

// Abrir/Cerrar chatbot
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
CloseChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

// Enviar mensaje con botón
sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
