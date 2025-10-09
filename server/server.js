require('dotenv').config({ path: './config/.env' });
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

// Get companySecret from environment variables
const companySecret = process.env.COMPANY_SECRET;
const host = process.env.HOST;
const companyId = process.env.COMPANY_ID;
const menuKey = process.env.MENU_KEY; // This will be a string
const tenant = process.env.TENANT;
const userId = process.env.USER_ID;
//const menuId = process.env.MENU_ID; // This will be a string
//const cobrowseHost = process.env.COBROWSE_HOST
//const cobrowseLicense = process.env.COBROWSE_LICENSE

// Ensure companySecret is loaded
if (!companySecret) {
    console.error("Error: COMPANY_SECRET is not defined in the environment or .env file.");
    process.exit(1); // Exit if the secret is not found
}
if (!host || !companyId || !menuKey || !tenant) {
    console.error("Error: One or more ccaas configuration variables (HOST, COMPANY_ID, Menu_Key, TENANT) are missing in the environment or .env file.");
    process.exit(1);
}

// Define a list of allowed origins. This allows both localhost and 127.0.0.1
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));


app.get('/api/get-chat-token', (req, res) => {
    try {
        const now = Math.floor(Date.now() / 1000);
        //const expiresIn = now + 20; // 20 seconds
        const expiresIn = now + (24 * 60 * 60); // 24 hours

        const payload = {
            nbf: now,
            iat: now,
            exp: expiresIn,
        };

        // Check if userId is present (not null, not undefined) and not an empty string
        if (userId != null && userId !== "") {
            payload.identifier = userId;
        }

        const token = jwt.sign(payload, companySecret, { algorithm: 'HS256' });
        console.log("[Info] Server Auth Token",token)
        res.json({ token });

    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

app.get('/api/get-signed-payload', (req, res) => {
    try {
        // Define the custom payload claims (your specific data)
        const customPayload = {
            // Your custom, non-standard claims go here
            custom_data: {
                          testurl: {
                                      label: 'Testurl',
                                      value: 'http://abc.com'
                                    },
                          chattranscript: {
                                      label: 'chatTranscript',
                                      value: 'http://chatTranscript.com'

                                  },
                          }
        };

        // Define the signing options (standard claims)
        const signOptions = {
            // Standard claims are handled by jwt.sign options:
            algorithm: 'HS256',
            expiresIn: '24h',       // Handles 'exp' (Expiration Time)
            notBefore: 0,           // Handles 'nbf' (Not Before) - setting to 0 ensures it's valid immediately
        };

        // 3. Generate the token
        const token = jwt.sign(
            customPayload,
            companySecret,
            signOptions
        );

        console.log("[Info] Server payload Token generated: ",token);
        res.json({ token });

    } catch (error) {
        console.error("Error generating token:", error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// Endpoint to provide ccaas configuration to the client
app.get('/api/ccaas-config', (req, res) => {
    res.json({
        host: host,
        companyId: companyId,
        menuKey: menuKey,
        tenant: tenant
    });
});


app.listen(port, () => {
  console.log(`Authentication server listening at http://localhost:${port}`);
});
