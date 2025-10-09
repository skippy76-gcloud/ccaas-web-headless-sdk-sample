// src/api/config.js

const CCAAS_CONFIG_URL = "http://localhost:3000/api/ccaas-config";

/**
 * Global variable to hold the fetched configuration.
 * @type {object}
 */
export let ccaasConfig = {};

/**
 * Fetches the CCaaS configuration from the server.
 * @returns {Promise<void>}
 * @throws {Error} if fetching fails.
 */
export async function fetchCcaasConfig() {
    try {
        const resp = await fetch(CCAAS_CONFIG_URL);
        if (!resp.ok) throw new Error('Failed to fetch ccaas configuration');
        ccaasConfig = await resp.json();
        console.log("[Info] CCaaS Configuration fetched:", ccaasConfig);
    } catch (error) {
        console.error("Error fetching ccaas configuration:", error);
        throw error;
    }
}