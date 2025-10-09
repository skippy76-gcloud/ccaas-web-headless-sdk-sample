// src/chat/dom-elements.js

// --- Global UI State ---
export const DOM = {};
export let currentAttachedFile = null;
export let formName = null;
export let formSignature = null;
export let formCompletionMessage = null;

export function setCurrentAttachedFile(file) {
    currentAttachedFile = file;
}
export function setFormInfo(name, signature) {
    formName = name;
    formSignature = signature;
}

/**
 * Hooks up all necessary DOM elements and stores them in the exported DOM object.
 */
export function hookDOMElements() {
    DOM.startChatBtn = document.getElementById("startChatBtn");
    DOM.chatWindow = document.getElementById("chatWindow");
    DOM.sendMessageBtn = document.getElementById("send-message-btn");
    DOM.attachmentInput = document.getElementById('attachment-input');
    DOM.chatInput = document.getElementById("chat-input");
    DOM.messagesDiv = document.getElementById("chat-messages");
    DOM.closeChatBtn = document.getElementById("closeChatBtn");
    DOM.minimizeChatBtn = document.getElementById("minimizeChatBtn");
    DOM.screenShareBtn = document.getElementById("screen-share-btn");

    // Add initial check for critical elements
    if (!DOM.messagesDiv || !DOM.startChatBtn) {
        console.error("[CRITICAL]: Essential DOM elements are missing!");
    }
}

/**
 * Appends a message object to the chat window, rendering different message types.
 * This is the bulk of your original appendMessage function.
 * @param {object} message - The message object from the SDK.
 */
export function appendMessage(message) {
    const messagesDiv = DOM.messagesDiv;
    if (!messagesDiv) {
        console.error("[Error] messagesDiv is not defined in DOM.");
        return;
    }

    const p = document.createElement('p');
    p.classList.add('message-bubble');

    // --- Message Rendering logic ---
    if (message.type === 'text' || message.text || message.content) {
        const isCustomer = message.$userType === 'end_user' || (message.identity && message.identity.is_customer);
        const senderName = (message.identity && message.identity.display_name) || (isCustomer ? 'You' : 'Agent');
        p.classList.add(isCustomer ? 'user' : 'agent');
        p.innerHTML = `<strong>${senderName}:</strong> ${message.text || message.content}`;
    } else if (message.file) {
        // ... File rendering logic ...
        p.classList.add('user');
        const fileName = message.file.name || 'Unknown File';
        const fileType = message.file.type || 'unknown';
        let fileDisplayContent = ``;
        if (fileType.startsWith('image/')) {
            fileDisplayContent = `🖼️ Image: <strong>${fileName}</strong>`;
        } else if (fileType.startsWith('video/')) {
            fileDisplayContent = `🎥 Video: <strong>${fileName}</strong>`;
        } else {
            fileDisplayContent = `📄 File: <strong>${fileName}</strong> (${fileType.split('/')[1] || fileType})`;
        }
        const senderName = (message.identity && message.identity.display_name) || 'You';
        p.innerHTML = `<strong>${senderName}:</strong> ${fileDisplayContent}`;
    } else if (message.type === 'form') {
        // ... Form rendering logic ...
        p.classList.add('agent');
        const formData = message.form;
        const title = formData.title || formData.name || 'Form Available';
        const formUrl = formData.preview_endpoint;

        // *** CRITICAL UPDATE: Store form details before rendering ***
        setFormInfo(formData.name, message.signature);

        // ... iframe/form rendering logic (copied from original main.js) ...
        if (formUrl) {
            const formContainer = document.createElement('div');
            formContainer.classList.add('embedded-form-container');
            const formTitle = document.createElement('h4');
            formTitle.textContent = title;
            formContainer.appendChild(formTitle);

            const formIframe = document.createElement('iframe');
            formIframe.src = formUrl;
            formIframe.style.width = '100%';
            formIframe.style.height = '400px';
            formIframe.style.border = '1px solid #ddd';
            formIframe.style.borderRadius = '8px';
            formIframe.setAttribute('allowfullscreen', '');
            formIframe.id = `form-iframe-${Date.now()}`;

            formContainer.appendChild(formIframe);
            p.appendChild(formContainer);
        } else {
            p.textContent = `Error: Form "${title}" is missing a preview URL.`;
        }
    } else if (message.type === 'content_card' && message.cards) {
        // ... Content Card rendering logic ...
        p.classList.add('agent');
        const senderName = (message.identity && message.identity.display_name) || 'Agent';
        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('content-cards-container');

        message.cards.forEach(cardData => {
            const card = document.createElement('div');
            card.classList.add('content-card');

            if (cardData.images && cardData.images.length > 0) {
                const img = document.createElement('img');
                img.src = cardData.images[0];
                img.alt = cardData.title || 'Card Image';
                card.appendChild(img);
            }

            if (cardData.title) {
                const title = document.createElement('h3');
                title.textContent = cardData.title;
                card.appendChild(title);
            }

            if (cardData.subtitle) {
                const subtitle = document.createElement('p');
                subtitle.classList.add('content-card-subtitle');
                subtitle.textContent = cardData.subtitle;
                card.appendChild(subtitle);
            }

            if (cardData.body) {
                const body = document.createElement('p');
                body.classList.add('content-card-body');
                body.textContent = cardData.body;
                card.appendChild(body);
            }

            if (cardData.link) {
                const link = document.createElement('a');
                link.href = cardData.link;
                link.textContent = 'Learn More';
                link.target = '_blank';
                card.appendChild(link);
            }

            if (cardData.buttons && cardData.buttons.length > 0) {
                const cardButtonGroup = document.createElement('div');
                cardButtonGroup.classList.add('button-group');

                cardData.buttons.forEach(buttonData => {
                    const button = document.createElement('button');
                    button.classList.add('chat-button', `button-style-${buttonData.style || 'default'}`);
                    button.textContent = buttonData.title;

                    button.addEventListener('click', () => {
                        console.log(`Content Card Button '${buttonData.title}' clicked!`);
                        if (buttonData.auto_reply) {
                            console.log(`Sending '${buttonData.title}' as a reply.`);
                            const userResponseP = document.createElement('p');
                            userResponseP.classList.add('message-bubble', 'user');
                            userResponseP.textContent = buttonData.title;
                            messagesDiv.appendChild(userResponseP);
                            messagesDiv.scrollTop = messagesDiv.scrollHeight;

                            cardButtonGroup.querySelectorAll('.chat-button').forEach(btn => btn.disabled = true);

                            client.sendTextMessage(buttonData.title)
                                .catch(error => {
                                    console.error("Error sending text message:", error);
                                });
                        } else {
                            console.log("This button does not auto-reply.");
                        }
                    });
                    cardButtonGroup.appendChild(button);
                });
                card.appendChild(cardButtonGroup);
            }
            cardsContainer.appendChild(card);
        });
        p.innerHTML = `<strong>${senderName}:</strong>`;
        p.appendChild(cardsContainer);

    } else if (message.type === 'inline_button' && message.buttons) {
        // ... Inline Button rendering logic ...
        p.classList.add('agent');

        let html = `<strong>${(message.identity && message.identity.display_name) || 'Agent'}</strong>`;
        if (message.title) {
            html += `<div>${message.title}</div>`;
        }

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        message.buttons.forEach(buttonData => {
            const button = document.createElement('button');
            button.classList.add('chat-button');
            button.textContent = buttonData.title;

            button.addEventListener('click', () => {
                console.log(`Button '${buttonData.title}' clicked! Sending '${buttonData.title}' as a reply.`);

                const userResponseP = document.createElement('p');
                userResponseP.classList.add('message-bubble', 'user');
                userResponseP.textContent = buttonData.title;
                messagesDiv.appendChild(userResponseP);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;

                buttonGroup.querySelectorAll('.chat-button').forEach(btn => btn.disabled = true);

                client.sendTextMessage(buttonData.title)
                    .catch(error => {
                        console.error("Error sending text message:", error);
                    });
            });

            buttonGroup.appendChild(button);
        });

        p.innerHTML = html;
        p.appendChild(buttonGroup);

    } else if (message.$userType === 'end_user') {
        p.classList.add('user');
        const senderName = (message.identity && message.identity.display_name) || 'You';
        p.innerHTML = `<strong>${senderName}:</strong> ${message.text || message.content}`;
    } else if (message.$userType === 'agent' || message.$userType === 'system') {
        if (message.content) {
            p.classList.add('agent');
            const senderName = (message.identity && message.identity.display_name) || 'Agent';
            p.innerHTML = `<strong>${senderName}:</strong> ${message.text || message.content}`;
        }
    } else {
        if (message.identity && message.identity.is_customer) {
            p.classList.add('user');
            const senderName = (message.identity && message.identity.display_name) || 'You';
            //p.textContent = message.text || message.content;
            p.innerHTML = `<strong>${senderName}:</strong> ${message.text || message.content}`;
        } else {
            if (message.content) {
                p.classList.add('agent');
                const senderName = (message.identity && message.identity.display_name) || 'Agent';
                p.innerHTML = `<strong>${senderName}:</strong> ${message.text || message.content}`;
            }
        }
    }

    if (p.innerHTML) {
        messagesDiv.appendChild(p);
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}