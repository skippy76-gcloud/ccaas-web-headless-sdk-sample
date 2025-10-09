// src/main.js

// Imports for Configuration and Authentication
import { fetchCcaasConfig, ccaasConfig } from './api/config.js';
import { fetchSignedPayload } from './api/auth.js';

// Imports for Client Initialization
import { initializeClient } from './chat/client.js';

// Imports for DOM and Chat Logic
import { hookDOMElements, DOM, appendMessage } from './chat/dom-elements.js';
import { setChatContext, setupSDKEvents, setupUIListeners } from './chat/chat-logic.js';


// --- Main application initialization function ---
async function initializeChatApp() {
    hookDOMElements(); // Get DOM references first

    // Load CCaaS Configuration
    try {
        await fetchCcaasConfig();
    } catch (error) {
        DOM.messagesDiv.innerHTML = '<div class="system-message">Error: Could not load chat configuration. Please try again later.</div>';
        console.error("Failed to initialize chat app due to configuration error.");
        return;
    }

    // Fetch Tokens and Initialize Client
    let client;
    let signedPToken;
    let queue;
    let chatHistory;
    let chatStatus = false;

    try {
        signedPToken = await fetchSignedPayload();
        client = initializeClient();
        
        // SDK operations requiring the client
        [queue, chatHistory] = await Promise.all([
            client.getMenus(ccaasConfig.menuKey),
            //client.getChatHistory(1),
        ]);
        
        client.chat = await client.loadOngoingChat();
        if(client.chat){
            chatStatus = true;
        }
        
        console.log("[Info] Client initialized successfully");
        console.log("[Info] queue/menu id:", queue.menus[0].id);
        console.log("[Info] Is there any Ongoing chat:", chatStatus ? 'Yes' : 'No');

    } catch (error) {
        console.error("Error during client/data setup:", error);
        DOM.messagesDiv.innerHTML = '<div class="system-message">Error: Failed to set up chat client components.</div>';
        return;
    }
    
    //Set context for the logic module
    setChatContext(client, queue, signedPToken, chatHistory, chatStatus);

    //Setup Event Listeners
    setupSDKEvents(); // SDK Events
    setupUIListeners(); // DOM Events

}

// Call the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeChatApp);