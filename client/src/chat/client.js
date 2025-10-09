// src/chat/client.js
import { Client } from "@ujet/websdk-headless";
import { authenticate } from '../api/auth.js';
import { ccaasConfig } from '../api/config.js';

/**
 * Initializes and returns the CCaaS Client SDK instance.
 * @returns {Client} The initialized Client instance.
 */
export function initializeClient() {
    if (!ccaasConfig.companyId) {
        throw new Error("[Error] Client cannot be initialized: CCaaS Configuration is missing.");
    }
    
    let client;
    try {
        client = new Client({
            companyId: ccaasConfig.companyId,
            tenant: ccaasConfig.tenant,
            host: ccaasConfig.host,
            authenticate: authenticate, // Function imported from api/auth.js
        });
    } catch (error) {
        console.error("[Error] Failed to initialize Client:", error);
        throw new Error(`[Fatal] Client initialization failed: ${error.message}`);
    }
    return client;
}