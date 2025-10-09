// src/api/auth.js

const CHAT_TOKEN_URL = "http://localhost:3000/api/get-chat-token";
const SIGNED_PAYLOAD_URL = "http://localhost:3000/api/get-signed-payload";

/**
 * Fetches the authentication JWT from the server.
 * This function is passed directly to the Client SDK constructor.
 * @returns {Promise<{token: string}>}
 * @throws {Error} if fetching fails.
 */
export async function authenticate() {
    try {
        const resp = await fetch(CHAT_TOKEN_URL,);
        if (!resp.ok) throw new Error('Failed to fetch auth token');
        const token = await resp.json();
        console.log("[Info] Received Auth Token", token);
        return token;
    } catch (error) {
        console.error("Authentication Error:", error);
        throw error;
    }
}


/**
 * Fetches the signed payload token from the server for custom data.
 * @returns {Promise<{token: string}>}
 * @throws {Error} if fetching fails.
 */
export async function fetchSignedPayload() {
    try {
        //console.log("[Info] Fetching signed Payload Token");
        const resp = await fetch(SIGNED_PAYLOAD_URL);
        if (!resp.ok) throw new Error('Failed to fetch signed payload token');
        const token = await resp.json();
        console.log("[Info] Received Signed Payload Token", token);
        return token;
    } catch (error) {
        console.error("[Error] Error getting Signed Payload Token:", error);
        throw error;
    }
}