# AI & Plagiarism Detection Bot

This Telegram bot helps you check your work for AI-generated content and plagiarism. It supports `.pdf`, `.docx`, `.doc`, and `.txt` file formats.

## Features

-   **AI Content Detection:** Detects content generated by AI models like ChatGPT, Gemini, and Claude.
-   **Plagiarism Detection:** Checks for plagiarism in your documents.
-   **Free Trials:** New users get 2 free trials.
-   **Subscription:** Option to buy a subscription for unlimited use.
-   **Supported File Types:** Supports `.pdf`, `.docx`, `.doc`, and `.txt` files.
-   **Admin Announcements:** Allows admins to make announcements to all users.

## Setup Instructions

Follow these steps to set up and run the bot:

### Prerequisites

-   Node.js (v16 or higher)
-   npm (Node Package Manager)
-   Telegram account
-   Copyleaks account (for plagiarism and AI detection)
-   PostgreSQL database

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/shodievSA/ai-plagiarims-detection-bot.git
    cd ai-plagiarims-detection-bot
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

### Configuration

1.  **Set up environment variables:**

    Create a `.env` file in the root directory of the project with the following variables:

    ```env
    BOT_TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
    DB_USER=<YOUR_POSTGRESQL_USER>
    DB_PASSWORD=<YOUR_POSTGRESQL_PASSWORD>
    DB_NAME=<YOUR_POSTGRESQL_DATABASE_NAME>
    DB_HOST=<YOUR_POSTGRESQL_HOST>
    DB_PORT=<YOUR_POSTGRESQL_PORT>
    WEBHOOK_URL=<YOUR_WEBHOOK_URL> # e.g., https://your-domain.com/webhook
    COPYLEAKS_EMAIL=<YOUR_COPYLEAKS_EMAIL>
    COPYLEAKS_API_KEY=<YOUR_COPYLEAKS_API_KEY>
    ERRORS_BOT_TOKEN=<YOUR_ERRORS_BOT_TOKEN> # Token for a separate bot to report errors
    ```

    Replace the placeholder values with your actual credentials and configurations.

    -   `BOT_TOKEN`:  You can obtain your bot token from [BotFather](https://t.me/BotFather) on Telegram.
    -   `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`: PostgreSQL database credentials.
    -   `WEBHOOK_URL`: The URL where Telegram will send updates.  This needs to be a publicly accessible URL (if running locally, you might use a tool like `ngrok`).
    -   `COPYLEAKS_EMAIL`, `COPYLEAKS_API_KEY`: Copyleaks API credentials. You need to sign up for a Copyleaks account to get these.
    -   `ERRORS_BOT_TOKEN`: Token for a separate Telegram bot used to report errors. Create another bot with BotFather and get its token to report errors. This helps in monitoring the main bot's health and debugging issues.

2.  **Database Setup:**

    Ensure you have a PostgreSQL database set up and running. The bot uses Sequelize as an ORM to interact with the database.  The database URL is constructed in `config.js` using the environment variables you set.

### Running the Bot

1.  **Start the bot:**

    ```bash
    npm start
    ```

    This command executes `node index.js`, which starts the bot and sets up the webhook.

### Webhooks

-   **Setting up a webhook:**

    The bot automatically attempts to set up a webhook using the `WEBHOOK_URL` environment variable. Make sure your server is accessible from the internet and that the URL is correctly configured.

-   **Copyleaks Webhooks:**

    The application uses Copyleaks webhooks to handle plagiarism scanning results. The following endpoints are configured:

    -   `/webhook/copyleaks/status`: Receives status updates from Copyleaks.
    -   `/webhook/copyleaks/completed`: Receives the completed scan results from Copyleaks.
    -   `/webhook/export/:scanID/result/:resultID`: Handles individual result exports.
    -   `/webhook/export/scanId/:scanID/completion`: Handles completion of the export process.
    -   `/webhook/export/:scanID/pdf-version/:chat_id/:telegram_id`: Receives the generated PDF report.
    -   `/webhook/copyleaks/error`:  Handles errors reported by Copyleaks.

### Key Files

-   `bot.js`: Main file for the Telegram bot. Handles commands, messages, and webhook setup.
-   `commands/`: Contains command handlers for the bot (e.g., `start.js`, `checkUserFile.js`, `buySubscription.js`).
-   `middlewares/`: Contains middleware functions for authentication, logging, and subscription checks.
-   `services/`: Contains services for database interaction (`dbServices.js`) and Copyleaks API calls (`copyleaks.js`).
-   `db/`: Contains database-related files (`index.js` for Sequelize setup and `models/user.js` for the user model).
-   `utils/`: Contains utility functions, such as formatting dates (`formatDate.js`), logging (`logger.js`), and converting images to base64 (`imageBase64.js`).
-   `.env`: Environment variables configuration file.

## Bot Commands

-   `/start`: Starts the bot and displays a welcome message.
-   `📄 Check my work`:  Requests the user to send a file for plagiarism and AI detection.
-   `💳 Buy subscription`: Displays subscription information and provides a contact to purchase.
-   `🧑‍💻 My profile`: Displays user profile information, including subscription status and free trials left.
-   `/users`: (Admin only) Retrieves a list of all users.
-   `/credits`: (Admin only) Retrieves the available Copyleaks credits.
-   `/announcement`: (Admin only) Allows admins to send announcements to all users.

## Error Handling

The bot includes error handling to manage issues such as:

-   Database errors
-   Copyleaks API errors
-   File processing errors

Errors are logged to the console and to a separate Telegram bot (if `ERRORS_BOT_TOKEN` is configured) for monitoring.

## Additional Information

-   **Database:** The bot uses PostgreSQL to store user data, including subscription status and usage.
-   **Copyleaks:** The Copyleaks API is used for plagiarism and AI content detection. You need a Copyleaks account and API key to use this feature.
-   **Logging:** The bot uses Winston for logging events and errors. Logs are stored in the `logs/` directory.
-   **Admin Privileges:** Certain commands (`/users`, `/credits`, `/announcement`) are restricted to administrators.  The admin user IDs are hardcoded in the command handlers. Make sure to change those to your own Telegram user ID.
-   **Free Trials:** New users get 2 free trials, which are tracked in the database. After the free trials are exhausted, users need to buy a subscription to continue using the bot.

This README provides a comprehensive guide to setting up and running the AI & Plagiarism Detection Bot. Ensure you follow all the steps carefully and configure the environment variables correctly for the bot to function properly.
