// src/chat/chat-logic.js
import { DOM, appendMessage, currentAttachedFile, setCurrentAttachedFile, formName, formCompletionMessage } from './dom-elements.js';

// Global variables for the chat logic
let chatQueue = null;
let signedPToken = null;

// The Client object and chat history will be passed in from main.js
let client = null;
let chatHistory = null;
let isOngoingChat;


/**
 * Initializes necessary context for chat logic.
 * @param {Client} sdkClient - The initialized SDK client.
 * @param {object} queue - The menu queue object.
 * @param {object} sToken - The signed payload token object.
 * @param {object} history - The chat history object.
 * @param {boolean} isOngoingChat - The ongoing chat boolean.
 */
export function setChatContext(sdkClient, queue, sToken, history, cStatus) {
    client = sdkClient;
    chatQueue = queue;
    signedPToken = sToken;
    chatHistory = history;
    isOngoingChat = cStatus;    
}


export async function startChat() {
    if (!client || !chatQueue) {
        console.error("Chat client or queue not initialized.");
        return;
    }
    
    console.log("[Info] Attempting to load/create chat...");
    DOM.chatWindow.style.display = 'flex';
    DOM.startChatBtn.style.display = 'none';
    DOM.messagesDiv.innerHTML = '<div class="system-message">Connecting...</div>';

    const custom_data = {
        /*
        unsigned: {
            "version": { "label": "Version", "value": "1.0.0" }
        },
        signed: signedPToken.token
        */
    };

    if (isOngoingChat) {
        console.log("[Info] Ongoing chat found: ", client.chat);
        client._triggerEvent("chat.connected");
    } else {
        console.log("[Info] No ongoing chat found. Creating new chat...");
        client.createChat(chatQueue.menus[0].id, { custom_data })
            .catch(error => {
                console.error("Error creating chat:", error);
                DOM.messagesDiv.innerHTML = '<div class="system-message">Error: Could not start chat.</div>';
            });     
    }
}


export async function minimizeChatInterface() {
    isOngoingChat = true;
    DOM.chatWindow.style.display = 'none';
    DOM.startChatBtn.style.display = 'block';
    console.log("[Info] Chat window minimized..");
}

export async function closeChatInterface() {
    if (client.chat) {
        console.log("[Info] Ending chat...");
        await client.finishChat();
    }
}

export async function cobrowseStart() {
    console.log("[Info] Screen share button clicked. Initiating cobrowse code creation...");
    
    if (!client || !client.createCobrowseCode || !client.startCobrowse) {
        console.error("Cobrowse client object or its methods are not defined.");
        alert("Cobrowse service is currently unavailable.");
        return;
    }

    let cobrowseCode;
    try {
        cobrowseCode = await client.createCobrowseCode(); // Uncomment when ready to test
        //cobrowseCode = '000000'; // Placeholder
        console.log("Cobrowse Code received:", cobrowseCode);
    } catch (error) {
        console.error("Error creating cobrowse code:", error);
        alert("Failed to generate screen share code. Please try again.");
        return;
    }

    const shouldStart = confirm(
        `Your Screen Share Code is: ${cobrowseCode}\n\n` +
        `Please share this code with your agent.\n\n` +
        `Click 'OK' to start sharing your screen now, or 'Cancel' to close.`
    );

    if (shouldStart) {
        try {   
            //await client.startCobrowse();
            console.log("Cobrowse started successfully.");
        } catch (error) {
            console.error("Error starting cobrowse session:", error);
            alert(`Failed to start screen share. Error: ${error.message || error}`);
        }
    } else {
        console.log("User canceled screen share start.");
    }
}


export function sendMessage(textParam) {
    if (!client || !client.sendTextMessage || !client.sendFileMessage) {
        console.error("Client not ready to send message.");
        return;
    }

    // --- File Message Logic ---
    if (currentAttachedFile) {
        console.log("[Info] Attempting to send file:", currentAttachedFile.name);

        const optimisticFileMessage = {
            file: { name: currentAttachedFile.name, type: currentAttachedFile.type },
            identity: { is_customer: true, display_name: 'You' }
        };
        appendMessage(optimisticFileMessage);

        client.sendFileMessage(currentAttachedFile)
            .catch(error => console.error("[Error] Error sending file message:", error))
            .finally(() => {
                setCurrentAttachedFile(null);
                DOM.attachmentInput.value = null;
                DOM.chatInput.value = '';
                DOM.chatInput.disabled = false;
            });
        return;
    }

    // --- Text Message Logic ---
    const messageText = textParam || DOM.chatInput.value.trim();

    if (messageText) {
        console.log("[Info] Message to be sent:", messageText);

        const optimisticMessage = {
            text: messageText,
            identity: { is_customer: true, display_name: 'You' }
        };
        appendMessage(optimisticMessage);

        if (!textParam) {
            DOM.chatInput.value = "";
        }

        client.sendTextMessage(messageText)
            .catch(error => console.error("Error sending text message:", error));
    } else if (!textParam) {
        alert("Please type a message or select a file to send.");
    }
}


export function handleFormCompletion(event) {
    // Only process messages from the expected origin if possible, or validate structure
    // if (event.origin !== 'EXPECTED_FORM_DOMAIN') { return; } // Highly recommended for security

    const message = event.data;
    if (message && message.type === 'form_complete') {
        console.log('🎉 Form submission received via postMessage!', message);
        
        // This is the message you want to send back to the CCaaS SDK
        const submissionNotiMessage = {
            type: 'noti',
            content: '',
            event: 'formCompleted',
            form_name: formName, // Uses the stored form name
            signature: message.signature,
            form_data: message.data // Include the form data if needed by the agent system
        };

        const ongoingChatInstance = client.chat;
        if (ongoingChatInstance) {
            ongoingChatInstance.sendMessage(submissionNotiMessage)
                .then(() => console.log("[Info] Form completion notification sent to agent."))
                .catch(e => console.error("[Error] Failed to send form completion notification:", e));
            
            // Optional: Visually confirm the submission in the chat UI
            appendMessage({
                $userType: 'agent',
                content: `Thank you, your form **${formName || 'Form'}** has been submitted!`
            });
        } else {
            console.error("[Error] Cannot send form completion notification: Chat instance is not active.");
        }
    }
}


/**
 * Sets up all core SDK event listeners and chat history logic.
 */
export function setupSDKEvents() {
    if (!client) return;

    // --- Chat Connect and History ---
    client.on("chat.connected", () => {
        console.log("[Event] Chat connected.");
        DOM.messagesDiv.innerHTML = '';
        const systemMessage = document.createElement('div');
        systemMessage.classList.add('system-message');
        systemMessage.textContent = 'Chat session started';
        DOM.messagesDiv.appendChild(systemMessage);
           
        // Load history and messages
        if (chatHistory && chatHistory.chats) {
            console.log("[Info] chat history:",chatHistory);
            chatHistory.chats.forEach(chat => chat.entries.forEach(appendMessage));
        }
        client.fetchMessages().then(messages => messages.forEach(appendMessage));
    });

    // --- Message Listener ---
    client.on("chat.message", (message) => {
        console.log("[Event] chat.message", message);
        if (message.$userType === 'end_user') {
            console.log("[Info] chat.message Ignoring echo of user's own message.");
            return;
        }
        if (message.type === 'noti' && message.event === 'escalationStarted') {
            console.log("[Info] chat.message Human escalation started..");
            return;
        }
        if (message.type === 'noti' && message.event === 'memberLeft') {
            console.log("[Info] chat.message VA Left..");
            return;
        }
        if (message.type === 'noti' && message.event === 'escalationAccepted') {
            console.log("[Info] chat.message Human Accepted");
            return;
        }
        if (message.type === 'noti' && message.event === 'chatEnded') {
            console.log("[Info] chat.message End session triggered");
            return;
        }
        if (message.type === 'noti' && message.event === 'formRequested') {
            console.log("[Info] chat.message Form Requested");
            return;
        }
        if (message.type === 'noti' && message.event === 'cobrowseRequestedFromAgent'){
            console.log("[Info] chat.message ScreenShare Requested By Customer Care");
            //cobrowseStart();
            return;
        }
        appendMessage(message);
    });
    
    // --- Chat Updated (Status changes, Dismissed) ---
    client.on("chat.updated", (chat) => {
        // ... (Your chat.updated logic, including the button creation for dismissed status, goes here) ...
        console.log("[Event] Updated chat:", chat);
        if (chat.state.status === 'dismissed') {
            const chatOptionsGroup = document.createElement('div');
            chatOptionsGroup.classList.add('chat-options-group');
            // ... (Button creation logic for 'Continue conversation', 'Start a new conversation', 'Exit chat') ...
            const buttonTexts = [ "Continue conversation", "Start a new conversation", "Exit chat" ];

            buttonTexts.forEach(text => {
                const button = document.createElement('button');
                button.classList.add('chat-option-button');
                button.textContent = text;
                
                button.addEventListener('click', async () => {
                    if (text === "Continue conversation") {
                        try { await client.resumeChat(chat.state.id); } catch (e) { console.warn("Could not resume chat:", e); }
                    } else if (text === "Exit chat") {
                        closeChatInterface();
                    } else if (text === "Start a new conversation") {
                        await client.destroyChat();
                        startChat(); // Call startChat from this module
                    }
                });
                chatOptionsGroup.appendChild(button);
            });
            DOM.messagesDiv.appendChild(chatOptionsGroup);
            DOM.messagesDiv.scrollTop = DOM.messagesDiv.scrollHeight;
        }
        // ... (Status text display logic) ...
        if (chat.state.status && chat.state.status_text) {
             const systemMessage = document.createElement('div');
             systemMessage.classList.add('system-message');
             // Simplified status text cleaning
             systemMessage.textContent = chat.state.status_text.replace(/<[^>]*>?/gm, ''); 
             DOM.messagesDiv.appendChild(systemMessage);
             DOM.messagesDiv.scrollTop = DOM.messagesDiv.scrollHeight;
         }
    });

    // --- Other SDK Events (cobrowse, ready, etc.) ---
    client.on("authenticated", () => console.log("[Event] **** client is authenticated****"));
    client.on("ready", () => console.log("[Event] **** client is ready****"));
    client.on("chat.memberLeft", (identity) => console.log("[Event] Chat Member Left", identity));
    client.on("chat.memberJoined", (identity) => console.log("[Event] Chat Member Joined", identity));
    client.on("chat.ongoing", (chat) => console.log("[Event] Chat Ongoing Event", chat));
    client.on("cobrowse.request", from => console.log("[Event] cobrowse session requested from", from));
    client.on("cobrowse.loaded", session => console.log("[Event] cobrowse session loaded", session));
    client.on("cobrowse.updated", session => console.log("[Event] cobrowse session updated", session));
    client.on("cobrowse.ended", session => console.log("[Event] cobrowse session ended", session));
    // --- Chat Ended ---
    client.on("chat.ended", () => {
        console.log("[Event] End session event received!");
        isOngoingChat = false;
        DOM.chatWindow.style.display = 'none';
        DOM.startChatBtn.style.display = 'block';
        //closeChatInterface();
    });
}

/**
 * Sets up all UI element event listeners.
 */
export function setupUIListeners() {
    DOM.startChatBtn.addEventListener("click", startChat);
    DOM.sendMessageBtn.addEventListener("click", () => sendMessage());

    DOM.chatInput.addEventListener("keypress", function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    /*DOM.closeChatBtn.addEventListener("click", () => {
        if (client.chat) {
            console.log("[Info] Close button clicked. Ending chat...");
            client.finishChat();
        }
    });*/
    
    DOM.closeChatBtn.addEventListener("click", closeChatInterface);
    DOM.minimizeChatBtn.addEventListener("click", minimizeChatInterface);

    DOM.screenShareBtn.addEventListener("click", cobrowseStart);
    
    DOM.attachmentInput.addEventListener('change', function(event) {
        const selectedFile = event.target.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
        
        if (selectedFile) {
            if (!allowedTypes.includes(selectedFile.type)) {
                alert('Only JPG, PNG, and MP4 files are allowed.');
                event.target.value = null;
                setCurrentAttachedFile(null);
                DOM.chatInput.value = '';
                DOM.chatInput.disabled = false;
                return;
            }
            setCurrentAttachedFile(selectedFile);
            DOM.chatInput.value = `Attached: ${selectedFile.name}`;
            DOM.chatInput.disabled = false;
        } else {
            setCurrentAttachedFile(null);
            DOM.chatInput.value = '';
            DOM.chatInput.disabled = false;
        }
    });

    // Listener for postMessage from the embedded form iframe
    window.addEventListener('message', handleFormCompletion);
}