# CCaaS Web Headless SDK Chat Demo

This repository contains a demonstration of a chat application built using a CCaaS Web Headless SDK. It showcases a basic client-server architecture where the Node.js backend handles secure authentication and configuration delivery, while the pure JavaScript frontend provides the chat user interface.

## 🚀 Features

* **Client-Server Architecture:** Separated frontend and backend for clear responsibilities.
* **Secure Authentication:** Backend (`server.js`) generates signed JSON Web Tokens (JWTs) for client authentication with the headless SDK.
* **Dynamic Configuration:** Backend provides necessary SDK configuration variables to the client, loaded securely from environment variables.
* **Chat Interface:** A simple web-based chat interface (`main.js`, `index.html`, `style.css`) for interacting with the ccai platform.
* **Message Handling:** Displays text messages, file messages, inline buttons, and rich content cards received from the SDK.
* **File Attachment:** Supports sending image and video attachments.
* **Environment Variable Management:** Utilizes `server/config/.env` files for managing sensitive and environment-specific configurations.

## 📁 Project Structure

The project is organized into two main directories:
```
.
├── Readme.md
├── client/
│   ├── index.html
│   ├── additional.html
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── main.js
│       └── style.css
│       └── api/
│           └── auth.js
│           └── config.js
│       └── chat/
│           └── client.js
│           └── chat-logic.js
│           └── dom-elements.js
└── server/
    ├── config
    ├── package.json
    ├── package-lock.json
    └── server.js

```

## 🏗️ Architecture

![alt text](https://github.com/ayushbisaria/ccaas-web-headless-sdk-sample/blob/main/architecture.png?raw=true)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

* [**Node.js**](https://nodejs.org/en/download/) (LTS version recommended)
* [**npm**](https://www.npmjs.com/get-npm) (comes with Node.js)
* [**CCAIP Instance**]: You must have a ccaip instance. At least one web queue should be configured, one human agent is assigned to the queue and direct access point with some label should be configured in that queue.

## 🚀 Setup & Installation

Follow these steps to get the demo up and running on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/ayushbisaria/ccaas-web-headless-sdk-sample.git)
    cd ccaas-web-headless-sdk-sample
    ```
2.  **Backend Setup:**
    Navigate into the `server` directory, install its dependencies, and set up its environment variables.

    ```bash
    cd server
    npm install
    cd config
    mv env.example .env
    ```
    Now, open the `.env` file in your `server/config` directory and fill in the actual values. **Do NOT commit your `.env` file to Git.**

    ```dotenv
    # server/.env
    COMPANY_SECRET="YOUR_CCAIP_COMPANY_SECRET_FROM_CCAIP_DEVELOPER_SETTINGS"
    HOST="YOUR_CCAIP_HOST"
    COMPANY_ID="YOUR_CCAIP_COMPANY_ID_FROM_CCAIP_DEVELOPER_SETTINGS"
    MENU_KEY="YOUR_QUEUE_DIRECT_ACCESS_POINT_NAME"
    TENANT="YOUR_CCAIP_TENANT_NAME"
    ```

3.  **Frontend Setup:**
    Navigate into the `client` directory, install its dependencies, and set up its environment variables.

    ```bash
    cd ../client # Go back to the root and then into client directory
    npm install
    ```
---

## 🚀 Running the Application

There are two ways to run the application:

### Option 1: Recommended (Using `npm run dev` from root)

This method uses `concurrently` to start both the backend and frontend simultaneously. This is the easiest way to get everything running.

1.  From the **root directory** of your project (`ccaas-web-headless-sdk-sample/`), run:
    ```bash
    npm install
    npm run dev
    ```
    This command will:
    * Start the backend server on `http://localhost:3000`.
    * Start the frontend development server (Vite) and automatically open your browser to the client application (e.g., `http://localhost:5173`).

    **Note:** Due to the asynchronous nature of starting two servers, you might occasionally experience a "failed to load config" error on the very first auto-opened browser tab. A quick manual browser refresh (F5 or Cmd+R) should resolve this as it allows the backend server sufficient time to be fully ready.

### Option 2: Manual Start (Alternative)

If you prefer to start each component individually, or if you encounter issues with the recommended method:

1.  **Start the Backend Server:**
    Open your first terminal window, navigate to the `server` directory, and run:
    ```bash
    cd server
    node server.js
    ```
    You should see a message like: `Authentication server listening at http://localhost:3000`.

2.  **Start the Frontend Development Server:**
    Open a second terminal window, navigate to the `client` directory, and run:
    ```bash
    cd client
    npm run dev
    ```
    This will start the Vite development server and automatically open the client application in your browser (e.g., `http://localhost:5173`).

---

## ⚙️ Headless Web SDK Methods/Events Utilized

The client-side code (main.js) extensively utilizes various methods and listens for events provided by the [Headless web SDK](https://cloud.google.com/contact-center/ccai-platform/docs/headless-web-guide) to manage the chat lifecycle and interactions. Below is a summary of the key methods and events implemented in this demo:

### Methods Used:

* `getMenus`: Get Queue details based on direct access point
* `createChat`: Initiates a new chat session with the ccai platform.
* `finishChat`: Ends an ongoing chat session.
* `resumeChat`: Resumes a dismissed chat.
* `loadOngoingChat`: load ongoing chat in case of page reloads.
* `destroyChat`: destroys the current ongoing chat.
* `fetchMessages`: Retrieves the history of messages for the current chat.
* `sendTextMessage`: Sends a plain text message from the user.
* `sendFileMessage`: Sends a file (e.g., image, video) as an attachment in the chat.

### Events Used:

* `ready`: Fired when the SDK is successfully initialized and ready for interaction.
* `authenticated`: Indicates that the client has been successfully authenticated with the ccai platform.
* `chat.ongoing`: Triggered when a chat session transitions to an ongoing state.
* `chat.message`: Fired when a new message (text, file, custom payload) is received in the chat.
* `chat.update`: Provides updates on the chat session status or properties.
* `chat.connected`: Indicates that the chat connection has been successfully established.
* `chat.ended`: Indicates that the chat is ended.
* `chat.destroyed`: Indicates that the chat session is destroyed.
* `chat.dismissed`: Indicates that the chat has gone into dismissed state.

## 💡 Technical Notes

* The client-side `main.js` fetches the ccai-platform configuration (`host`, `companyId`, `menuId`, `tenant`) and the JWT authentication token from the Node.js backend(server). This prevents hardcoding sensitive or environment-specific SDK details directly in the client-side bundle.
* The `server.js` uses `dotenv` to load configurations from its `config/.env` file, ensuring secrets are not exposed in the codebase.
* The `package-lock.json` files in both `server/` and `client/` are committed to the repository to ensure consistent dependency installations across all environments.

---

## 🛠️ Technologies Used

* **Backend:**
    * [Node.js](https://nodejs.org/en/)
    * [Express.js](https://expressjs.com/)
    * [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
    * [cors](https://www.npmjs.com/package/cors)
    * [dotenv](https://www.npmjs.com/package/dotenv)
* **Frontend:**
    * HTML, CSS, JavaScript (Vanilla JS)
    * [Vite](https://vitejs.dev/) (as the development server and build tool)
    * [@ujet/websdk-headless](https://www.npmjs.com/package/@ujet/websdk-headless) ( Headless Web SDK)
* **Project Management:**
    * [npm](https://www.npmjs.com/)
    * [concurrently](https://www.npmjs.com/package/concurrently) (for running multiple scripts)

---
