const API_KEY = 'AIzaSyAToUy60RXVyR-mDVtUZqMAu3beoanKCP0';
const SYSTEM_PROMPT = "You are an agricultural AI assistant. Your primary focus is on providing information about agriculture, farming, seeds, crop protection, and related topics. For general conversation (like greetings), keep responses brief and friendly. For non-agricultural questions, politely explain that you specialize in agriculture-related topics. Detect and respond in the same language as the user's input. Format responses properly with: Paragraphs for detailed explanations, numbered lists (1,2,3) for steps, and bullet points (•) for key information.";

let isBotTyping = false;

// Function to show typing indicator
function showTypingIndicator() {
    if (isBotTyping) return;

    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar bot-avatar';
    avatar.innerHTML = '🌱';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    isBotTyping = true;
}

// Function to hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    isBotTyping = false;
}

// Function to generate AI response
async function generateResponse(userMessage) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    try {
        const response = await fetch(`${url}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`
                    }]
                }]
            })
        });

        const data = await response.json();
        let botResponse = data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't generate a response.";

        return formatResponse(botResponse);
    } catch (error) {
        console.error('Error:', error);
        return "Sorry, I'm having trouble responding right now. Please try again later.";
    }
}

// Function to format bot response
function formatResponse(text) {
    // Bold only important headings or points (e.g., text wrapped in **)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Format numbered lists (e.g., 1., 2., 3.)
    text = text.replace(/(\d+\.)\s+(.+)/g, '<br>$1 <strong>$2</strong>');

    // Format bullet points (e.g., *, •)
    text = text.replace(/(\*|•)\s+(.+)/g, '<br>• $2');

    // Add paragraph breaks for double newlines
    text = text.replace(/\n\n/g, '</p><p>');

    // Ensure single newlines are treated as line breaks
    text = text.replace(/\n/g, '<br>');

    return `<p>${text}</p>`;
}



// Function to add messages to chat window
function addMessage(message, isUser = false, isHTML = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    const avatar = document.createElement('div');
    avatar.className = `avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
    avatar.innerHTML = isUser ? '👤' : '🌱';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = isHTML ? message : message.replace(/\n/g, '<br>');

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to display the initial message on page load
function displayInitialMessage() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = ''; // Clear previous messages

    addMessage(
        "<p>👋 Hello! I'm your <strong>AgriAI Assistant</strong>. 🌱 I can help with:</p>" +
        "<p><strong>1.</strong> Crop rotation<br>" +
        "<strong>2.</strong> Pest control<br>" +
        "<strong>3.</strong> Soil health<br>" +
        "<strong>4.</strong> Farming techniques<br>" +
        "<strong>5.</strong> Seed selection</p>" +
        "<br>" +
        "<p><strong>Ask me a question:</strong></p>" +
        "<p>• What are the benefits of crop rotation?</p>" +
        "<p>• How can I prevent pests from attacking my crops?</p>" +
        "<p>• What is the ideal soil pH for growing vegetables?</p>" +
        "<p>• How do I select the best seeds for my farm?</p>",
        false,
        true
    );
}

// Function to reset the chat and display the initial message
function resetChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = ''; // Clear all messages
    displayInitialMessage(); // Display the initial message again
    isBotTyping = false;
}

// Function to send user message
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';

    showTypingIndicator();
    const response = await generateResponse(message);
    hideTypingIndicator();

    addMessage(response, false, true);
}

// Event listeners for sending messages
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
document.getElementById('sendButton').addEventListener('click', () => {
    sendMessage();
});

// Event listener for reset button
document.getElementById('clearButton').addEventListener('click', () => {
    resetChat();
});

// Display the initial message when the page loads
window.onload = () => {
    displayInitialMessage();
};
