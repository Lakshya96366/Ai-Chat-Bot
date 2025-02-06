const API_KEY = 'AIzaSyAToUy60RXVyR-mDVtUZqMAu3beoanKCP0';
const SYSTEM_PROMPT = `You are an agricultural AI assistant.
Primary Focus: Provide accurate, verified information only on agricultural topics, including:
- General Agriculture
- Soil and Fertility
- Crops and Planting
- Irrigation and Water Management
- Pest and Disease Management
- Climate and Weather
- Agricultural Equipment and Machinery
- Agricultural Economics
- Food Safety and Processing
- Environmental Impact
- Agricultural Research and Innovation
- Agricultural Certification and Standards
- Farm Labor
- Agro-Industrial and Agritourism

Data Accuracy Protocol:
Multi-Layer Verification (100x Checks):
1. Source Verification: Collect data only from peer-reviewed journals (Agronomy Journal), government databases (USDA, FAO), and academic institutions. Reject unverified sources.
2. Cross-Verification: Check facts across 3+ independent trusted sources (FAO, World Bank Agri-Data). Use majority consensus or most recent data (≤5 years old).
3. Standards Alignment: Align answers with ISO 22000, GlobalG.A.P., and peer-reviewed research.
4. Location-Specific: Adjust recommendations based on user's location, crop type, and climate.
5. Data Recency: Remove data older than 5 years unless foundational. Use exact metrics (e.g., "pH 6.5").
6. User Feedback: After answering, ask: "Did this address your needs? Please report gaps." Update knowledge within 24 hours for errors.
7. Weekly Reviews: Check new trends and FAO alerts.

Error Prevention:
- Flag illogical claims (e.g., conflicting irrigation advice)
- If uncertain: "Let me verify this. Could you clarify [specific detail]?"

User Interaction Rules:
Language: Detect and respond in the user's input language
Greetings: Keep brief (e.g., "Hi! How can I help with your farm query today?")
Non-Agricultural Responses: "I specialize in agriculture to ensure accurate help. Ask me about crops, soil, farming tools, or related topics!"`;

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
